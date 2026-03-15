# XerahS website

Static site for [XerahS](https://github.com/ShareX/XerahS), built with Jekyll and hosted on GitHub Pages.

## Blog and SEO

- **Blog calendar** (`blog.html`): Lists daily blog posts; each day links to a dedicated page for sharing and search engines.
- **Per-post pages** are generated from the `_blog_posts` collection. To add new dates (e.g. after new posts are pushed to the XerahS repo), run:
  ```bash
  node scripts/update-blog-posts.mjs
  ```
  then rebuild the site.

## Build

```bash
bundle exec jekyll build
```

Serve locally:

```bash
bundle exec jekyll serve
```
