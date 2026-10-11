// Replace every texture with a flat, slightly desaturated color (avg of the original texture).
// Usage: node scripts/flat-materials.mjs in.glb out.glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, meshopt } from '@gltf-transform/functions';
import { getBounds } from '@gltf-transform/core';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

const [input, output] = process.argv.slice(2);
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder,
});
const doc = await io.read(input);

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
for (const mat of doc.getRoot().listMaterials()) {
  let rgb = mat.getBaseColorFactor().slice(0, 3);
  const tex = mat.getBaseColorTexture();
  if (tex) {
    const { channels } = await sharp(Buffer.from(tex.getImage())).stats();
    rgb = rgb.map((f, i) => f * toLinear(channels[i].mean / 255));
  }
  const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  const warm = [1.04, 1.0, 0.92];
  rgb = rgb.map((c, i) => Math.min(1, (lum + (c - lum) * 0.55) * warm[i]));
  mat.setBaseColorFactor([...rgb, mat.getBaseColorFactor()[3]]);
  mat.setBaseColorTexture(null).setNormalTexture(null)
     .setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
  const glass = mat.getAlphaMode() === 'BLEND' ||
    (mat.getExtension('KHR_materials_transmission')?.getTransmissionFactor() ?? 0) > 0;
  if (!glass) mat.setRoughnessFactor(Math.max(mat.getRoughnessFactor(), 0.55));
}
// Big low-poly boxes are the bench and cabinets. Push them back so the
// instruments read as the subject instead of sitting on a white slab.
const whole = getBounds(doc.getRoot().listScenes()[0]);
const wholeMax = Math.max(...whole.max.map((v, i) => v - whole.min[i]));
const furniture = doc.createMaterial('furniture')
  .setBaseColorFactor([0.54, 0.53, 0.5, 1])
  .setRoughnessFactor(0.85)
  .setMetallicFactor(0);
const plinth = doc.createMaterial('plinth')
  .setBaseColorFactor([0.68, 0.67, 0.64, 1])
  .setRoughnessFactor(0.8)
  .setMetallicFactor(0);
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const { min, max } = getBounds(node);
  const size = max.map((v, i) => v - min[i]);
  const big = Math.max(...size) > wholeMax * 0.45;
  if (!big) continue;
  const tris = mesh.listPrimitives().reduce(
    (t, p) => t + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0);
  if (tris > 5000) continue; // detailed parts keep their own look
  const flat = size.filter((v) => v < wholeMax * 0.08).length > 0;
  for (const p of mesh.listPrimitives()) p.setMaterial(flat ? plinth : furniture);
}

doc.getRoot().listExtensionsUsed()
  .find((e) => e.extensionName === 'KHR_draco_mesh_compression')?.dispose();
await doc.transform(prune(), dedup(), meshopt({ encoder: MeshoptEncoder }));
await io.write(output, doc);
