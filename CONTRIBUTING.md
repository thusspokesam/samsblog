# Adding a guide

Add one `.md` file under `docs/product-engineering/` or `docs/deploy-ops/`.
Do not edit navigation, HTML cards, counts, search data, or collection indexes.
Run `python scripts/build.py`; CI runs the same command on every push/PR.
Commit only the source Markdown. `index.md` is reserved for generated landings.

```yaml
---
title: Firmware validation
summary: Verify firmware against the approved platform baseline.
section: deploy-ops
type: Procedure
owner: TODO
status: draft
order: 25
tags: []
---
```

| Field | Rules / default when omitted |
| --- | --- |
| `title` | Single-line plain text, no HTML; first H1, otherwise filename converted to title case. |
| `summary` | One-line string; defaults to `Documentation for <title>.` |
| `section` | `product-engineering` or `deploy-ops`; inferred from the first directory under `docs/`. Outside those directories it must be explicit. |
| `type` | `Procedure`, `Guide`, `Reference`, or `Record`; default `Guide`. |
| `owner` | One-line team/person identifier; default `TODO`. |
| `status` | `new`, `updated`, `draft`, `deprecated`, or `stable`; default `draft`. Stable has no badge. Status is editorial, not calculated from Git. |
| `order` | Integer; default `1000`. Lower numbers come first, then title (case-insensitive), then path for ties. Use gaps of 10 for pipeline steps. |
| `tags` | Optional list of strings; default `[]`. Reserved only, stripped from staged page metadata so search does not expose tag filters. |

Missing values get defaults; invalid values fail the build with a filename.
The existing seven pages are draft templates, not approved operational instructions.
Drafts are visible, counted, and searchable; `draft` is not an access-control setting.
Deprecated guides stay in their collection and search, are visually muted, and are
excluded from Recently updated. Empty collections are not counted or shown on Home;
their generated index URL remains available. No extra categories are generated.

Dates come from `git log -1 --follow --format=%cI -- docs/<file>` (committer time).
Commit content changes to advance the date. An uncommitted edit retains its last
commit date; a new untracked file has no date. Source archives and shallow clones
show “Update date unavailable” and omit Recently updated. Use a full Git clone,
or `git fetch --unshallow`, for reliable dates. CI uses `fetch-depth: 0`.
Git dates are edit dates, not review/approval dates. Ties use path deterministically.

Deploy & Ops is an ordered list generated from `order`; the initial sequence is
deployment (10), validation (20), burn-in (30), onboarding (40).
Summaries wrap on small screens rather than being truncated.

# Local workflow

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
python scripts/build.py
python -m http.server 8000 --directory site
```

Open `http://localhost:8000/`. After editing/adding a guide, rerun
`python scripts/build.py` and refresh. Do not run bare `zensical build` or
`zensical serve` against the source config: generated metadata/nav would be absent.
For Zensical's preview server, first run `python scripts/build.py --generate-only`,
then `zensical serve -f .generated/mkdocs.yml`; regenerate after source edits.
This deliberately avoids unsupported hooks or custom MkDocs plugins.

All dependencies must be installed once. Subsequent builds need no network.
Only browser font requests use Google Fonts; system fonts are the offline fallback.
Serve the built site over HTTP(S), rather than opening `index.html` via `file://`.
Set `SOURCE_DATE_EPOCH` to a Unix timestamp for a reproducible build timestamp.

# One-file acceptance check

1. Add the example above as `docs/deploy-ops/firmware-validation.md`, with a heading
   and the unique body word `gpuacceptanceprobe`.
2. Build. Home must say `8 guides · 2 collections`. The Deploy & Ops card must count five articles. Open that collection to see
   the new title, summary and Draft badge; open the guide for type/owner/date.
   No HTML/config/template edits are needed.
3. Open Deploy & Ops: it must have five numbered entries, with the new guide
   between validation and burn-in. Header navigation must point to this index.
4. Open native search from the header or Cmd/Ctrl+K. Search `gpuacceptanceprobe`;
   confirm a body-text snippet. Use arrows, Enter, and Escape.
5. Commit the guide and rebuild: it should appear in Recently updated (latest five).
6. Set `status: deprecated`, commit and rebuild: keep the collection entry muted,
   remove it from Recently updated, retain searchability.
7. Delete the test guide and rebuild: count returns to seven; index/search lose it.
8. Check the white background, keyboard focus, and a 360px viewport. Confirm there is no
   horizontal page scrolling and descriptions/metadata remain legible.

Revisit tag filtering only when a section exceeds roughly 12–15 guides.
