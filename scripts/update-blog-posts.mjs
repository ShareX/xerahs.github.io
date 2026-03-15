#!/usr/bin/env node
/**
 * Syncs _blog_posts/ with blog dates from the XerahS GitHub repo.
 * Run before `jekyll build` so every discovered post has a dedicated SEO-friendly page.
 * Usage: node scripts/update-blog-posts.mjs
 */

import { readdir, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_POSTS_DIR = join(ROOT, '_blog_posts');
const API_ROOT = 'https://api.github.com/repos/ShareX/XerahS/contents/docs/blog?ref=develop';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function discoverDates() {
  const dates = [];
  const yearEntries = await fetchJson(API_ROOT);
  for (const yearEntry of yearEntries) {
    if (yearEntry.type !== 'dir') continue;
    const monthEntries = await fetchJson(yearEntry.url);
    for (const monthEntry of monthEntries) {
      if (monthEntry.type !== 'dir') continue;
      const files = await fetchJson(monthEntry.url);
      for (const file of files) {
        if (file.type !== 'file' || !/^blog-\d{8}\.md$/i.test(file.name)) continue;
        const raw = file.name.slice(5, 13);
        dates.push(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`);
      }
    }
  }
  return [...new Set(dates)].sort();
}

function frontMatter(date) {
  return `---
layout: blog_post
date: ${date}
---
`;
}

async function main() {
  let dates;
  try {
    dates = await discoverDates();
  } catch (e) {
    console.error('Failed to fetch blog list from GitHub:', e.message);
    process.exit(1);
  }
  await mkdir(BLOG_POSTS_DIR, { recursive: true });
  let added = 0;
  for (const date of dates) {
    const path = join(BLOG_POSTS_DIR, `${date}.md`);
    try {
      await writeFile(path, frontMatter(date), { flag: 'wx' });
      added++;
      console.log('Added:', date);
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
  }
  console.log(`Done. ${dates.length} posts total, ${added} new.`);
}

main();
