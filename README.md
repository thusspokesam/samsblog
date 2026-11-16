# GPUaaS Engineering & Operations Hub

Zensical 0.1.1 documentation site. Markdown front matter is the single source of
truth for guide listings, collection pages, navigation, counts and ownership.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the schema and one-file authoring flow.

## Content
- `docs/product-engineering/`: approved versions, benchmark results, and benchmarking methodology.
- `docs/deploy-ops/`: deployment, validation, burn-in, and onboarding (four acceptance gates, in order).
- `mkdocs.yml`: site navigation and theme settings.
- `overrides/`: the custom theme (page shell and partials).
- `docs/stylesheets/gpuaas.css`, `docs/assets/gpuaas.js`: all styling and behaviour. No third-party code.
- `docs/assets/brand/`: logo, mark and favicons.
- `DESIGN.md`: design system, decisions and maintenance notes.

To add a page, create the Markdown file and add it to `nav` in `mkdocs.yml`. Navigation, search, prev/next and the gate rail pick it up automatically.

## Build design

1. `scripts/build.py` validates every non-index Markdown guide in `docs/`.
2. It copies source docs and overrides to ignored `.generated/`, adds computed
   front matter, and writes a generated navigation config there.
3. MiniJinja loops over this generated metadata in `home.html`, `section.html`
   and the shared `hub-list.html`. The source Markdown stays untouched.
4. Zensical renders all pages and produces its native `search.json` and local
   search worker. The script copies the successful output to `site/`.

The two section definitions are centralized in `SECTIONS` in the build script.
Adding a guide to either section does not require editing that mapping.
All collection indexes are generated. Root and section `index.md` files are
reserved shells, not authored guides and not included in counts/search.

Use `python scripts/build.py`, not a bare Zensical build. No unsupported plugin
API, arbitrary Python call from a template, or undocumented global page list is
required. Rebuilding cleans the staging tree, so deleted guides leave no stale
HTML or search entries. Custom CSS/JS names are content-hashed in staging only.

## Search and shared UI

The native header, navigation, white palette and skip link are inherited from
Zensical. The shared `main.html` adds guide metadata and one maintenance footer
on every page. Search is available through the native header control only.
Native Zensical owns Cmd/Ctrl+K,
arrow navigation, Enter, Escape, snippets and indexing. No custom fetch/fallback
list remains. Tags are retained in source only for future filtering.

Guide edit links target the original Markdown. Generated home/collection edit
links target their templates. Report-an-issue links target this repository.
The footer timestamp is UTC; optionally set `SOURCE_DATE_EPOCH` for reproducibility.

## Styling and logo

Plain static CSS keeps this build free of Node/Tailwind/CDN dependencies.
It uses the theme's foreground/background variables and explicit accessible
secondary-text/accent tokens for the white palette. Font requests use the standard
Google Fonts theme setting (Inter and Roboto Mono), with system fallback offline.
There are no network calls in the generator. Install dependencies before going
offline; no external service is needed to generate pages or the search index.

`docs/assets/gpuaas-logo.png` is a standalone 187×72 PNG extracted from the
original stationery artwork, with the horizontal stationery line removed.
The wordmark was not redrawn. It is set through `theme.logo` and rendered as a
normal image: no oversized sprite, overflow clipping or position offset.
It retains the original white background.
The original `gpuaas-operations.png` remains unchanged for provenance.

## Git dates and editorial status

Last-updated uses each file's latest commit timestamp, following renames. A full
checkout is required; absent/shallow history disables dates and Recently updated.
Uncommitted changes do not pretend to have a new Git timestamp. Relative labels
update in the browser; ISO dates remain as no-JavaScript fallback and tooltips.
The recent list is sorted at build time, excludes deprecated pages, and takes at
most five. A status badge is editorial, not a substitute for review/approval.
Drafts remain visible and searchable; all seven starting guides are drafts.

## Verification and limitations

See `tests/test_pipeline.py`: real temporary Git repositories and strict Zensical
builds test adding, ordering, renaming, deprecating and deleting one guide, native
search indexing, no-Git defaults/escaping, shallow history and invalid metadata.
See `VERIFICATION.md` for the checks actually run on this delivery.

The build is not an automatic source watcher. CI rebuilds on pushes; locally use
the single build command after edits. Version upgrades need the integration tests
and native-search browser checks rerun. No tag UI, persona navigation, changelog,
extra categories or CMS is included.

## Help-center layout revision

The homepage follows the supplied help-center reference: left navigation, a
native header search, a plain recent-article list and two collection
cards. Metadata stays on individual guide pages. Collection indexes show titles,
summaries and Draft/Deprecated notices; Deploy & Ops keeps its numbered sequence.
White backgrounds are retained. Headings use a local system serif (Georgia),
while body text remains Inter. All content lists and counts remain generated.
