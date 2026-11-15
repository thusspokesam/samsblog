# Sam's Blog

A public Markdown blog built with MkDocs Material.

## One-time publishing setup

In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
Then open **Actions → Build and publish blog → Run workflow** if the first deployment ran before Pages was enabled.

Expected address: https://thusspokesam.github.io/samsblog/

## Write a post

Create a Markdown file in `docs/posts/`:

```markdown
---
date: 2026-11-15
categories:
  - Technology
description: A short summary.
---
# Your title

A short introduction.

<!-- more -->

The rest of your post.
```

Commit to `main`. The workflow builds and publishes the blog. Categories, archives, and search update automatically.

For a draft, add `draft: true` to the front matter. Images can go in `docs/assets/`; reference them from a post using `../assets/filename.png`.

## Preview locally

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

Open http://127.0.0.1:8000/samsblog/.

Run `mkdocs build --strict` before publishing. Site settings live in `mkdocs.yml`.
