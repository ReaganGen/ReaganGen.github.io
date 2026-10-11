// Remove mesh nodes whose largest bbox side exceeds a threshold. Usage: node scripts/drop-oversized.mjs in.glb out.glb 20
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
const [input, output, limit = '20'] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.read(input);
for (const n of doc.getRoot().listNodes()) {
  if (!n.getMesh()) continue;
  const { min, max } = getBounds(n);
  if (Math.max(...max.map((v, i) => v - min[i])) > Number(limit)) { console.log('dropping node', n.getName() || '(unnamed)'); n.dispose(); }
}
doc.getRoot().listExtensionsUsed().find((e) => e.extensionName === 'KHR_draco_mesh_compression')?.dispose();
await doc.transform(prune());
await io.write(output, doc);
