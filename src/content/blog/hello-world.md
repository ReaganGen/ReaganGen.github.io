---
title: Hello, world — a rendering test
description: A placeholder post that shows what math, code and tables look like on this site. Replace it with your first real post.
date: 2026-10-10
tags: [meta]
---

This is a placeholder post. Every Markdown file in `src/content/blog/` becomes a page. Set `draft: true` in the front matter to hide a post.

## Math

Inline math uses single dollar signs, like $\mathcal{L} = -\log p_\theta(x)$. Display math uses double dollar signs:

$$
\mathcal{L}_{\text{ELBO}} = \mathbb{E}_{q_\phi(z \mid x)}\left[\log p_\theta(x \mid z)\right] - D_{\mathrm{KL}}\left(q_\phi(z \mid x) \,\|\, p(z)\right)
$$

## Code

Fenced code blocks get syntax highlighting:

```python
import torch

def kl_gaussian(mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
    """KL divergence between N(mu, sigma^2) and N(0, I)."""
    return -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp(), dim=-1)
```

## Tables and quotes

| Model | Params | Spearman |
| ----- | -----: | -------: |
| Baseline | 10M | 0.50 |
| Ours | 12M | 0.60 |

> The numbers in this table are made up — they are only here to show the styling.

## Images

Put images in `public/images/blog/` and reference them as `![alt text](/images/blog/file.png)`.
