import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://reagangen.github.io',
  devToolbar: { enabled: false },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: 'everforest-light', dark: 'everforest-dark' },
      wrap: false,
    },
  },
});
