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
  { name: 'K9', note: 'Lipid that transfect Chondrocyte rather than Hepatocyte', src: '/models/k9.sdf', tag: 'Reference' },
  { name: 'R-CAR', note: 'Designed CAR mRNA', src: '/models/mc3.sdf', tag: 'Reference' },
  { name: 'SM-102', note: 'Benchmark ionizable lipid', src: '/models/sm102.sdf', tag: 'Reference' },
];
