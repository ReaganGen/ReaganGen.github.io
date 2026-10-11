# personal-site

My personal website, built with [Astro](https://astro.build) and deployed to
GitHub Pages at <https://reagangen.github.io>.

## Running it locally

All tooling lives in the conda env `personal-site` (Node 22 + RDKit).

```bash
conda activate personal-site
npm install        # first time only
npm run dev        # http://localhost:4321, reloads as you edit
npm run build      # production build into dist/
```

## Publishing

Every push to `main` rebuilds and redeploys automatically, usually within
two or three minutes:

```bash
git add -A && git commit -m "update projects" && git push
```

## Editing the content

Nothing below needs you to touch the layout or the styling.

| What you want to change | File |
| --- | --- |
| Name, role, email, research interests, CV link, avatar | `src/data/profile.ts` |
| Links shown under the intro, in the footer and on Contact | `src/data/profile.ts` → `socials` |
| Projects — one file each | `src/content/projects/*.md` |
| Publications | `src/data/publications.json` |
| News items | `src/data/news.json` |
| Blog posts | `src/content/blog/*.md` |
| Album captions | `src/data/album.ts` |
| Album photos | drop files into `public/images/album/` |
| Project figures and other images | `public/images/` |
| 3D models | `public/models/` |

### A project

Each file in `src/content/projects/` is one project. The front matter at the
top controls the card; everything under it is the write-up in the detail
window.

```markdown
---
title: MOLEA
tagline: One line that shows on the card and in the dock.
kind: Research          # Research | Agent | Platform
period: 2025 – 2026
order: 4                # smaller numbers come first
venue: Nat. Biotech. 2026   # optional
status: In progress         # optional, used when there is no venue
image: /images/projects/molea.png   # optional
links:
  - { label: Paper, href: "https://..." }
  - { label: Code, href: "https://..." }
stack: [Graph neural networks, Contrastive learning]
---

- A bullet about what the project does.
- Another one. **Bold** works, so do [links](https://example.com).
```

Deleting a file removes the project everywhere. Adding one needs a matching
icon in `src/components/ProjectIcon.astro`, keyed by the filename.

### A blog post

Each file in `src/content/blog/` is one post.

```markdown
---
title: What diffusion models get wrong about proteins
description: One sentence, shown in the list and in search results.
date: 2026-11-02
tags: [proteins, diffusion]
draft: false            # true hides it from the site
---

Inline maths like $E = mc^2$ and display maths both work:

$$
\mathcal{L} = -\log p_\theta(x)
$$

Code is highlighted:

```python
print("hello")
```
```

Images go in `public/images/blog/` and are referenced as
`![alt text](/images/blog/file.png)`.

### Album photos

Drop images into `public/images/album/`. They appear in filename order, so
`01-toronto.jpg`, `02-lab.jpg` controls the sequence. Captions are optional
and live in `src/data/album.ts`, keyed by filename. The panel hides itself
while the folder is empty.

### Molecules

Three slots sit on the home page, listed in `src/data/molecules.ts`. To add a
structure, generate a 3D conformer from a SMILES string:

```bash
python scripts/gen-molecule.py "<SMILES>" "<Name>" public/models/<file>.sdf
```

Then point an entry in `molecules.ts` at that file.

### The LUMI-lab model

Put the raw CAD export at `raw/sdl.raw.glb` (gitignored — it is far too large
for the repository), then run `npm run model`. That drops the background wall,
renders the bench and cabinets as ghost volumes, and compresses the result
into `public/models/lumi-lab.glb`.

## Contact form

The chat on `/contact/` posts to [Web3Forms](https://web3forms.com); the access
key is in `src/data/profile.ts`. Messages arrive at the address registered
with Web3Forms, which is not necessarily the one shown on the site.
