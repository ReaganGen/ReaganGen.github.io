import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const link = z.object({ label: z.string(), href: z.string() });

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    kind: z.enum(['Research', 'Agent', 'Platform']),
    period: z.string(),
    order: z.number(),
    venue: z.string().optional(),
    status: z.string().optional(),
    image: z.string().optional(),
    links: z.array(link).default([]),
    stack: z.array(z.string()).default([]),
  }),
});

const publications = defineCollection({
  loader: file('./src/data/publications.json'),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number(),
    role: z.string().optional(),
    status: z.string().optional(),
    links: z.array(link).default([]),
  }),
});

const news = defineCollection({
  loader: file('./src/data/news.json'),
  schema: z.object({
    date: z.string(),
    text: z.string(),
    href: z.string().optional(),
  }),
});

export const collections = { blog, projects, publications, news };
