// List every mesh node in a GLB with its world-space bounding box. Usage: node scripts/list-parts.mjs in.glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/core';
import draco3d from 'draco3dgltf';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.read(process.argv[2]);
const rows = [];
for (const n of doc.getRoot().listNodes()) {
  const m = n.getMesh(); if (!m) continue;
  const { min, max } = getBounds(n);
  const size = max.map((v, i) => v - min[i]);
  const tris = m.listPrimitives().reduce((t, p) => t + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0);
  const mats = [...new Set(m.listPrimitives().map((p) => p.getMaterial()?.getName() ?? ''))].join(',');
  rows.push({ node: n.getName(), mesh: m.getName(), mats, tris, size: size.map((v) => +v.toFixed(2)), min: min.map((v) => +v.toFixed(2)) });
}
rows.sort((a, b) => Math.max(...b.size) - Math.max(...a.size));
console.log(rows.length, 'mesh nodes');
for (const r of rows.slice(0, 15)) console.log(JSON.stringify(r));
