# personal-site

Personal website built with [Astro](https://astro.build). Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Setup

All tooling lives in the conda env `personal-site` (Node 22 + RDKit).

```bash
conda activate personal-site
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
```

## Where content lives

| What | File |
| --- | --- |
| Name, bio, email, socials, CV link | `src/data/profile.ts` |
| Projects (one file each) | `src/content/projects/*.md` |
| Publications | `src/data/publications.json` |
| News | `src/data/news.json` |
| Blog posts | `src/content/blog/*.md` (`draft: true` hides a post) |
| Images | `public/images/` |
| 3D models | `public/models/` |
| Molecule slots (3 on the home page) | `src/data/molecules.ts` |

Blog posts support `$inline$` and `$$display$$` math (KaTeX) and fenced code blocks.

## Molecules

Three slots sit on the home page, listed in `src/data/molecules.ts`. To add a structure, generate a 3D conformer from a SMILES string:

```bash
python scripts/gen-molecule.py "<SMILES>" "<Name>" public/models/<file>.sdf
```

Then point an entry in `molecules.ts` at that file.

## 3D platform model

Put the raw CAD export at `raw/sdl.raw.glb` (gitignored), then run `npm run model`. This removes the background wall, swaps textures for flat colors and compresses the result into `public/models/lumi-lab.glb`.
