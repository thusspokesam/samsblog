# Design: GPUaaS / Knowledge, "The Red Line"

The site is a public, template-only knowledge base for two teams (Product Engineering, Deploy & Ops). Its main idea is a sequence of four acceptance gates: Deployment, Validation, Burn-in, Onboarding. The old logo already had the right image: a long red rule running off the wordmark. That rule is now the organising device. It is the line under the header, the rail that carries the four gates on the home page, the progress bar on every gate page, and the connector at the foot of each page.

## Stack
- Zensical 0.1.1 reading `mkdocs.yml`. Custom theme in `overrides/` (`theme.custom_dir`). `base.html` is replaced, so none of the stock theme CSS/JS is loaded.
- Templates run on **MiniJinja**: no `str.split/startswith`, no `page.is_homepage`, `nav.homepage` or `page.parent`. Home is `page.url == ''`. `extra_javascript` entries are objects (`s.path | url`); `extra_css` entries are strings. `page` is undefined on the 404.
- One CSS file (`docs/stylesheets/gpuaas.css`, about 29 KB), one JS file (`docs/assets/gpuaas.js`, about 14 KB, vanilla). System fonts only. No CDN, no images except inline SVG and brand files.
- `scripts/version_assets.py` and CI are unchanged. Plain relative `extra_css`/`extra_javascript` paths let it hash the files per build (checked on a scratch copy).

## Tokens
All in the `:root` block of `gpuaas.css`. Light values are in `:root`; the dark set is written twice (OS preference unless the user chose light, and `html[data-theme=dark]`), so the manual toggle works in every engine and no `light-dark()` fallback is needed. Contrast pairs were designed to WCAG AA and re-measured from computed styles (see `verification.md`).
- Type: weights 400, 600, 700 (h3), 800 (h2, doc h1), 900 (home headline, italic, echoing the logo). The earlier 750/850 weights were dropped because system fonts do not have them.
- Body 17 px/1.65, measure 68ch; tables and code use the full column.
- Layout: sidebar at 1024 px, "On this page" column at 1400 px (it was 1280 px in the first plan; at 1280 px the 6-column Approved versions table did not fit next to it).

## Logo
`docs/assets/brand/logo.svg` and `overrides/partials/logo.html` (inline, follows the theme toggle) are a traced redraw of the original lockup: heavy italic GPUaaS, slash, red italic `r`, tracked OPERATIONS. The wordmark and `r` are traced outlines (script: `.agents/tasks/samsblog-redesign/verify/trace_logo.py`, marching squares at 8x). OPERATIONS is hand-built stroked geometry so it stays crisp. The long red rule is no longer part of the logo; it is the site's Red Line. `mark.svg`/`favicon.svg` use the slash and `r` on a near-black square. The original PNG was removed in the redesign; it is in git history at `f6a086a`.

## Behaviour
- Search: `search.json` from the Zensical search plugin, fetched on first use, ranked in the browser. A term matches as a substring of the title or body; word-prefix and title hits score higher (10/5/2/1), +6 when all terms hit the title, +2 for page-level items. Order: score desc, level asc, index asc. Row title: level 1 uses the title; level 2 uses `Page › Section` (for `path[1] == 'Overview'` it uses `path[0]`). Opens with `/` (outside inputs) and Cmd/Ctrl+K. The listbox holds only `li[role=option]`; the "No results" message and its suggestion buttons live in a sibling `#empty`; "Suggested" is a sibling heading.
- Gate labels: a pager link reads "Previous gate"/"Next gate" only when its target is one of the current section's gates; otherwise "Previous"/"Next" (an overview target reads "Deploy & Ops overview").
- Tables: wrapped in a region with `tabindex=0`; JS removes `role` and `tabindex` when the table does not overflow.
- Theme: OS preference by default (works without JS); toggle persists in `localStorage`.
- Code: copy button on every code block, `pre` gets `tabindex` only when it scrolls. No page currently contains a code block; the behaviour was tested on a fixture.
- Reduced motion turns off the one-time line draw and hover motion.

## Interpretations
- **External-host check (AC4):** covers all `site/**/*.html` and the CSS/JS referenced by pages. It excludes the unreferenced Zensical theme files in `site/assets/javascripts` and `site/assets/stylesheets` (they contain CDN URLs but no page loads them; the zero-cross-origin network log covers them), and ignores `xmlns` URIs and the repo/site URLs.
- **404 exemption (AC4/C2):** `404.html` is exempt from the no-root-absolute rule because GitHub Pages serves it from any depth; the engine emits `/samsblog/...` there. It is verified under `/samsblog/` only.
- The 404 template guards every use of `page` (title, canonical, prev/next).
- `main:focus:not(:focus-visible){outline:none}`: programmatic focus after the skip link shows no ring; keyboard focus still does.

## Maintenance
- **Add a page:** create the Markdown file and add it to `nav`. Nav, search, prev/next, sidebar and gate rail update on their own. To make a section a numbered gate sequence, add its title to `extra.sequential_sections`. To list it on the home page, add a card in `overrides/partials/home.html`.
- **When a page is approved:** update the "Template" chips and the hard-coded "Nothing is approved yet" strip in `overrides/partials/home.html` (there is a comment marking them), and the status in the page and section index. Status words in table cells are styled as chips only when the cell is exactly `Pending`, `Unapproved`, `Template`, `Not reviewed`, `Pass` or `Fail`.
- Markup the template rewrites (see `overrides/partials/content.html`): the `<p><strong>Status:</strong>` paragraph (status plate), exact `<td>` status cells, `<table>` (scroll wrapper), `<input type="checkbox" disabled/>` (aria-label).
- Browsers: current Chrome, Firefox, Safari. Needs `<dialog>`, `color-mix`, `:has`-free core.
