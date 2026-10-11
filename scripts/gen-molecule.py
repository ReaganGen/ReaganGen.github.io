"""Generate a 3D conformer SDF for the molecule viewer.

Usage: python scripts/gen-molecule.py "<SMILES>" "<Name>" public/models/out.sdf
"""
import sys
import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem

smiles, name, out = sys.argv[1], sys.argv[2], sys.argv[3]
mol = Chem.MolFromSmiles(smiles)
if mol is None:
    sys.exit(f"could not parse SMILES: {smiles}")
mol = Chem.AddHs(mol)
params = AllChem.ETKDGv3()
params.randomSeed = 7
cids = AllChem.EmbedMultipleConfs(mol, 30, params)
AllChem.MMFFOptimizeMoleculeConfs(mol, maxIters=2000)
# the most extended conformer reads best as a lipid
best = max(cids, key=lambda c: np.ptp(mol.GetConformer(c).GetPositions(), axis=0).max())
mol.SetProp("_Name", name)
with Chem.SDWriter(out) as w:
    w.write(mol, confId=best)
print(f"{name}: {mol.GetNumAtoms()} atoms -> {out}")
