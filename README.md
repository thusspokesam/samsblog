# AI Knowledge Base

Zensical knowledge base for Product Engineering and Deploy & Ops.

## Content
- `docs/product-engineering/`: approved versions, benchmark results, and benchmarking methodology.
- `docs/deploy-ops/`: deployment, validation, burn-in, and onboarding (four acceptance gates, in order).
- `mkdocs.yml`: site navigation and theme settings.
- `overrides/`: the custom theme (page shell and partials).
- `docs/stylesheets/gpuaas.css`, `docs/assets/gpuaas.js`: all styling and behaviour. No third-party code.
- `docs/assets/brand/`: logo, mark and favicons.
- `DESIGN.md`: design system, decisions and maintenance notes.

To add a page, create the Markdown file and add it to `nav` in `mkdocs.yml`. Navigation, search, prev/next and the gate rail pick it up automatically.

All operational documents begin as unapproved templates. Populate and review them before use. The site and repository are public: internal evidence, confidential procedures, and customer data belong in an approved access-controlled system.

## Preview and publish

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
zensical serve
zensical build --strict
```

Commits to main publish through GitHub Actions to https://thusspokesam.github.io/samsblog/.

Zensical reads the existing `mkdocs.yml` configuration. Content and page URLs remain unchanged.
