# Verification record — 2026-11-15

## Verified before implementation

- Current Zensical docs document MiniJinja, `theme.custom_dir`, per-page
  `template` front matter, and `page.meta`. They do not establish a complete
  global `pages` collection for this use case. The implementation therefore
  generates page metadata and nav before the Zensical build, then loops over
  that data in MiniJinja. Those actual loops passed strict local builds.
- Search is Zensical's own client-side engine, enabled by default; it is not
  Material/MkDocs Lunr. The installed 0.1.1 build produces `site/search.json`
  with page and section text and a bundled local search worker. We use the
  stock UI rather than treating the index format as a public API.
- `git-revision-date-localized` remains planned in current compatibility docs;
  arbitrary MkDocs plugins do not run. Git CLI extraction is used instead.
- The installed version rejects `site_dir` outside the config project root.
  Staging includes docs, overrides, config and build output together; the
  wrapper copies the successful site out afterwards.

Sources checked:

- https://zensical.org/docs/customization/
- https://zensical.org/docs/authoring/frontmatter/
- https://zensical.org/docs/setup/search/
- https://zensical.org/docs/compatibility/mkdocs/plugins/
- Installed `zensical==0.1.1`, `zensical-ui==0.0.42` templates and CLI help.

## Actually run

Environment: Python 3.12 on Linux; Zensical 0.1.1; native search UI 0.0.42.

- `python -m unittest discover -s tests -v`: 4 test methods passed. Tests use
  real temporary Git repositories and multiple strict Zensical builds.
- Added only one Markdown guide: homepage count became 8; collection and nav
  gained the page; order 25 placed it between validation and burn-in; a unique
  body word appeared in the native search index; latest-five metadata updated.
- Renamed the guide and checked its Git date; deprecated it and confirmed its
  exclusion from recent changes; deleted it and confirmed stale HTML/search
  content disappeared and count returned to 7.
- No-Git and shallow-Git handling; metadata defaults/escaping; invalid order,
  status, section, tags and HTML title validation.
- `python scripts/build.py`: strict clean build passed with no issues.
- `git diff --check`: passed.
- Browser: hero opens native search; query `burn-in` produces body snippets;
  ArrowDown changed the active option; ArrowUp and Enter opened Burn-in;
  Escape closes search; Ctrl+K and Meta+K open the native dialog.
- Browser: header Deploy & Ops link opened its generated section landing page
  showing four entries in the deployment → validation → burn-in → onboarding order.
- Browser: light and slate palette switching and shared guide header/footer.
- Browser: desktop grid/footer measured 896px; important sampled metadata and
  descriptions measured 12px/13px; no horizontal overflow.
- Browser: 360px iframe viewport (345px content plus scrollbar) rendered one
  column with no horizontal overflow; hero search opened and returned snippets.
- Calculated WCAG contrast ratios for custom readable-text tokens:
  light gray #4b5563 / white 7.56:1; gray / #f9fafb 7.23:1;
  red #b91c1c / white 6.47:1; dark secondary #cbd5e1 / #252a36 9.67:1;
  dark red #fca5a5 / #252a36 7.56:1.
- Source scan confirmed no custom fetch-based search or Tailwind browser CDN
  remains in docs, overrides or build scripts.

## Not claimed as tested

- GitHub Actions execution or production deployment of these changes.
- Safari, physical phones, screen readers, or an exhaustive WCAG audit.
- A network-isolated build/browser run. The generator contains no network
  calls; dependencies were installed before local builds. Google Fonts is
  still the optional external browser dependency, with system fallback.
- An undocumented global MiniJinja pages collection or a stable public
  JavaScript API for opening search. The homepage no longer needs a DOM trigger adapter.
- Automatic live regeneration while editing: run the wrapper locally after
  changes; CI already invokes it on each push or pull request.

## White-only revision — 2026-11-16

Kept the existing layout and information. Replaced the two-palette configuration
with a single default palette, removed the dark-mode switch and dark CSS tokens,
and made the hero, cards, page, header and footer backgrounds white.
The previous browser observations above describe the earlier two-palette version.
The white-only revision was checked with a strict local build and generated-HTML
assertions; it was not separately browser-tested or deployed.

## Help-center reference revision — 2026-11-16

Inspected the live supplied reference at https://support.claude.com/en/.
Implemented the white help-center layout and inspected its rendered desktop
preview. The strict build and all four integration tests passed after updating
assertions to check article-level details on collection/guide pages.

## Header-only search revision

Removed the duplicate homepage search control and its unused JavaScript/CSS.
The strict local build passed; generated HTML retains the native header search
and contains no custom hero search trigger. Native shortcut handling is unchanged.
