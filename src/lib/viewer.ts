// Shared 3D mounting logic for the inline cards and the expanded lightbox.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const cache = new Map<string, Promise<THREE.Group>>();

function load(src: string): Promise<THREE.Group> {
  if (!cache.has(src)) {
    cache.set(
      src,
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(src).then((g) => g.scene)
    );
  }
  return cache.get(src)!.then((scene) => scene.clone(true));
}

export type GLBOptions = { zoom?: boolean; assemble?: boolean; azimuth?: number };

export async function mountGLB(el: HTMLElement, src: string, opts: GLBOptions = {}) {
  const { zoom = false, assemble = true } = opts;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight('#fff6e8', 2.1);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0012;
  const fill = new THREE.DirectionalLight('#dce6ff', 0.55);
  const rim = new THREE.DirectionalLight('#ffffff', 1.1);
  scene.add(key, fill, rim);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = zoom;
  controls.enablePan = zoom;
  controls.autoRotate = !calm();
  controls.autoRotateSpeed = 0.55;
  controls.addEventListener('start', () => (controls.autoRotate = false));

  const resize = () => {
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(el);
  resize();

  const model = await load(src);
  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const span = box.getSize(new THREE.Vector3());
  const radius = span.length();

  // The bench and cabinets are plain boxes. Render them as ghost volumes with a
  // dashed wireframe so they place the instruments without competing with them.
  const ghostNames = new Set(['furniture', 'plinth']);
  const ghostFill = new THREE.MeshStandardMaterial({
    color: 0x8d8f96,
    transparent: true,
    opacity: 0.085,
    roughness: 1,
    metalness: 0,
    depthWrite: false,
  });
  const edgeMat = new THREE.LineDashedMaterial({
    color: 0x6e7076,
    transparent: true,
    opacity: 0.45,
    dashSize: radius * 0.012,
    gapSize: radius * 0.009,
  });

  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.Material | THREE.Material[];
    const name = Array.isArray(mat) ? mat[0]?.name : mat?.name;
    if (ghostNames.has(name ?? '')) {
      m.material = ghostFill;
      m.castShadow = false;
      m.receiveShadow = false;
      m.renderOrder = -1;
      const wire = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 25), edgeMat);
      wire.computeLineDistances();
      m.add(wire);
      return;
    }
    m.castShadow = true;
    m.receiveShadow = true;
  });

  // soft contact shadow so the flat blocks read as volumes
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 3, radius * 3),
    new THREE.ShadowMaterial({ opacity: 0.09 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(center.x, box.min.y - radius * 0.004, center.z);
  ground.receiveShadow = true;
  scene.add(ground);

  key.position.set(center.x + radius, center.y + radius * 1.3, center.z + radius * 0.8);
  key.target.position.copy(center);
  key.target.updateMatrixWorld();
  key.shadow.camera.left = -radius * 0.7;
  key.shadow.camera.right = radius * 0.7;
  key.shadow.camera.top = radius * 0.7;
  key.shadow.camera.bottom = -radius * 0.7;
  key.shadow.camera.far = radius * 4;
  key.shadow.camera.updateProjectionMatrix();
  fill.position.set(center.x - radius, center.y + radius * 0.4, center.z + radius);
  rim.position.set(center.x - radius * 0.6, center.y + radius * 0.5, center.z - radius);

  const dir = new THREE.Vector3(-0.75, 0.45, -0.55).normalize();
  controls.target.copy(center);
  camera.position.copy(center).add(dir.clone().multiplyScalar(radius * (zoom ? 1.05 : 1.45)));
  controls.update();

  // reverse explosion: every part flies in from outside and settles
  type Part = { node: THREE.Object3D; home: THREE.Vector3; from: THREE.Vector3; delay: number };
  const parts: Part[] = [];
  if (assemble && !calm()) {
    const tmp = new THREE.Box3();
    const c = new THREE.Vector3();
    for (const node of [...model.children]) {
      tmp.setFromObject(node);
      if (tmp.isEmpty()) continue;
      tmp.getCenter(c);
      const away = c.clone().sub(center);
      const reach = away.length() / (radius * 0.5) || 0.001;
      away.normalize();
      const home = node.position.clone();
      parts.push({
        node,
        home,
        from: home.clone().add(away.multiplyScalar(radius * 0.5)).add(new THREE.Vector3(0, radius * 0.12, 0)),
        delay: Math.min(0.45, reach * 0.3),
      });
    }
  }
  const DUR = 1.5;
  let t0 = 0;
  const ease = (x: number) => 1 - Math.pow(1 - x, 4);
  const step = (now: number) => {
    if (!parts.length) return true;
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;
    let done = true;
    for (const p of parts) {
      const k = Math.min(1, Math.max(0, (t - p.delay) / DUR));
      if (k < 1) done = false;
      p.node.position.lerpVectors(p.from, p.home, ease(k));
    }
    return done;
  };

  let visible = true;
  const vis = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  vis.observe(el);

  let settled = !parts.length;
  renderer.setAnimationLoop((now) => {
    if (!visible && settled) return;
    if (!settled) settled = step(now);
    controls.update();
    renderer.render(scene, camera);
  });

  return {
    replay() {
      t0 = 0;
      settled = !parts.length;
    },
    dispose() {
      ro.disconnect();
      vis.disconnect();
      renderer.setAnimationLoop(null);
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

const atoms = () => {
  const css = getComputedStyle(document.documentElement);
  const v = (n: string) => css.getPropertyValue(n).trim();
  return { C: v('--ink'), O: v('--accent'), N: v('--sage'), H: v('--muted') };
};

export async function mountSDF(
  el: HTMLElement,
  src: string,
  opts: { zoom?: number; interactive?: boolean } = {}
) {
  const $3Dmol = await import('3dmol');
  const sdf = await (await fetch(src)).text();
  // Inline cards keep the mouse out of the viewer: otherwise scrolling the page
  // over a molecule zooms the molecule instead.
  const viewer = $3Dmol.createViewer(el, {
    backgroundAlpha: 0,
    antialias: true,
    nomouse: !opts.interactive,
  });
  viewer.addModel(sdf, 'sdf');
  const paint = () => {
    const map = atoms();
    viewer.setStyle({}, {
      stick: { radius: 0.13, colorscheme: { prop: 'elem', map } },
      sphere: { scale: 0.22, colorscheme: { prop: 'elem', map } },
    });
    viewer.render();
  };
  paint();
  viewer.zoomTo();
  viewer.zoom(opts.zoom ?? 1.05);
  viewer.resize();
  viewer.render();
  if (!calm()) viewer.spin('y', 0.4);
  const onTheme = () => requestAnimationFrame(paint);
  window.addEventListener('themechange', onTheme);
  return {
    dispose() {
      window.removeEventListener('themechange', onTheme);
      viewer.clear();
      el.innerHTML = '';
    },
  };
}
