// Three slots on the home page. Swap these for your own lipids.
// To add a structure: conda activate personal-site, then
//   python scripts/gen-molecule.py "<SMILES>" "<Name>" public/models/<file>.sdf
export type Molecule = {
  name: string;
  note: string;
  src: string;
  tag?: string;
};

export const molecules: Molecule[] = [
  { name: 'SM-102', note: 'Benchmark ionizable lipid', src: '/models/sm102.sdf', tag: 'Reference' },
  { name: 'DLin-MC3-DMA', note: 'First-generation clinical lipid', src: '/models/mc3.sdf', tag: 'Reference' },
  { name: 'ALC-0315', note: 'Placeholder for a designed lipid', src: '/models/alc0315.sdf', tag: 'Reference' },
];
