"""Stage front-matter-driven docs, then run the pinned Zensical build.

Source files are never modified. Use this entry point instead of zensical build.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import quote

import yaml

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = {
    "product-engineering": ("Product Engineering", "Platform standards & performance.", False),
    "deploy-ops": ("Deploy & Ops", "From deployment to service readiness.", True),
}
TYPES = {"Procedure", "Guide", "Reference", "Record"}
STATUSES = {"new", "updated", "draft", "deprecated", "stable"}


def read_page(path):
    text = path.read_text(encoding="utf-8")
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n?", text, re.S)
    meta = yaml.safe_load(match[1]) or {} if match else {}
    if not isinstance(meta, dict):
        raise ValueError(f"{path}: front matter must be a mapping")
    return meta, text[match.end():] if match else text


def write_page(path, meta, body):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("---\n" + yaml.safe_dump(meta, sort_keys=False, allow_unicode=True)
                    + "---\n\n" + body.lstrip(), encoding="utf-8")


def git(root, *args):
    try:
        return subprocess.check_output(["git", "-C", str(root), *args],
                                       stderr=subprocess.DEVNULL, text=True).strip()
    except (OSError, subprocess.CalledProcessError):
        return ""


def git_available(root):
    # A shallow boundary can masquerade as a page's last edit. Never report it.
    return (git(root, "rev-parse", "--is-inside-work-tree") == "true"
            and git(root, "rev-parse", "--is-shallow-repository") == "false")


def last_updated(root, path):
    value = git(root, "log", "-1", "--follow", "--format=%cI", "--", path)
    try:
        return datetime.fromisoformat(value).astimezone(timezone.utc).isoformat()
    except ValueError:
        return None


def text_field(meta, key, default, path):
    value = meta.get(key, default)
    if value is None or value == "":
        value = default
    if not isinstance(value, str) or "\n" in value:
        raise ValueError(f"{path}: {key} must be a single-line string")
    if key == "title" and ("<" in value or ">" in value):
        raise ValueError(f"{path}: title must be plain text, without HTML")
    return value.strip() or default


def collect(root):
    docs = root / "docs"
    pages = []
    has_git = git_available(root)
    for source in sorted(docs.rglob("*.md")):
        rel = source.relative_to(docs)
        # Index pages are generated collection shells, not counted guides.
        if rel.name == "index.md":
            continue
        meta, body = read_page(source)
        section = meta.get("section", rel.parts[0] if len(rel.parts) > 1 else None)
        if section not in SECTIONS:
            raise ValueError(f"{rel}: section must be one of {', '.join(SECTIONS)}")
        heading = re.search(r"^#\s+(.+)$", body, re.M)
        title = text_field(meta, "title", heading[1] if heading else rel.stem.replace("-", " ").title(), rel)
        summary = text_field(meta, "summary", f"Documentation for {title}.", rel)
        owner = text_field(meta, "owner", "TODO", rel)
        kind = meta.get("type", "Guide")
        status = meta.get("status", "draft")
        order = meta.get("order", 1000)
        tags = meta.get("tags", [])
        if kind not in TYPES or status not in STATUSES:
            raise ValueError(f"{rel}: invalid type or status")
        if type(order) is not int:
            raise ValueError(f"{rel}: order must be an integer")
        if not isinstance(tags, list) or any(not isinstance(tag, str) for tag in tags):
            raise ValueError(f"{rel}: tags must be a list of strings")
        url = quote(rel.with_suffix("").as_posix(), safe="/") + "/"
        item = dict(title=title, summary=summary, section=section, type=kind,
                    owner=owner, status=status, order=order, tags=tags,
                    source=rel.as_posix(), url=url,
                    updated=last_updated(root, "docs/" + rel.as_posix()) if has_git else None)
        pages.append((item, meta, body))
    return pages


def stage(root=ROOT, destination=None):
    root = Path(root)
    destination = Path(destination) if destination else root / ".generated"
    pages = collect(root)  # Validate before replacing staging output.
    config = yaml.safe_load((root / "mkdocs.yml").read_text())
    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir(parents=True)
    shutil.copytree(root / "docs", destination / "docs")
    shutil.copytree(root / "overrides", destination / "overrides")
    groups = []
    for slug, (title, summary, sequence) in SECTIONS.items():
        items = sorted([item for item, _, _ in pages if item["section"] == slug],
                       key=lambda item: (item["order"], item["title"].casefold(), item["source"]))
        if items:
            groups.append(dict(slug=slug, title=title, summary=summary,
                               sequence=sequence, items=items, url=f"{slug}/"))
    recent = sorted([item for item, _, _ in pages
                     if item["updated"] and item["status"] != "deprecated"],
                    key=lambda item: (item["updated"], item["source"]), reverse=True)[:5]
    now = datetime.fromtimestamp(int(os.environ["SOURCE_DATE_EPOCH"]), timezone.utc) \
        if "SOURCE_DATE_EPOCH" in os.environ else datetime.now(timezone.utc)
    config.setdefault("extra", {})["hub_build"] = now.strftime("%Y-%m-%d %H:%M UTC")
    config["docs_dir"] = "docs"
    config["site_dir"] = "site"
    config["theme"]["custom_dir"] = "overrides"
    config["nav"] = [{"Home": "index.md"}]
    for group in groups:
        config["nav"].append({group["title"]: [{"Overview": group["slug"] + "/index.md"}]
                             + [{item["title"]: item["source"]} for item in group["items"]]})
    for item, meta, body in pages:
        meta.update({key: item[key] for key in ("title", "summary", "section", "type", "owner", "status", "order")})
        meta.pop("tags", None)  # Reserved in source; not exposed as native search filters yet.
        meta["description"] = meta.get("description", item["summary"])
        meta["hub_page"] = item
        write_page(destination / "docs" / item["source"], meta, body)
    home_meta, body = read_page(root / "docs/index.md")
    home_meta["hub"] = dict(groups=groups, recent=recent, count=len(pages), collections=len(groups))
    write_page(destination / "docs/index.md", home_meta, body)
    # Always generate the two landing pages, including graceful empty states.
    for slug, (title, summary, sequence) in SECTIONS.items():
        group = next((g for g in groups if g["slug"] == slug),
                     dict(slug=slug, title=title, summary=summary, sequence=sequence, items=[]))
        meta = dict(title=title, template="section.html", hide=["toc"],
                    hub_section=group, search={"exclude": True})
        write_page(destination / "docs" / slug / "index.md", meta, "")
    # Fingerprint only custom assets in the staging directory. Source config stays clean.
    for key in ("extra_css", "extra_javascript"):
        versioned = []
        for asset in config.get(key, []):
            path = destination / "docs" / asset
            digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
            target = path.with_name(f"{path.stem}.{digest}{path.suffix}")
            path.rename(target)
            versioned.append(target.relative_to(destination / "docs").as_posix())
        config[key] = versioned
    config_path = destination / "mkdocs.yml"
    config_path.write_text(yaml.safe_dump(config, sort_keys=False, allow_unicode=True))
    print(f"Generated {len(pages)} guides, {len(groups)} collections, {len(recent)} recent changes.")
    return config_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--generate-only", action="store_true")
    args = parser.parse_args()
    try:
        config = stage()
    except (ValueError, yaml.YAMLError) as error:
        parser.exit(1, f"Metadata error: {error}\n")
    if not args.generate_only:
        command = Path(sys.executable).parent / ("zensical.exe" if os.name == "nt" else "zensical")
        subprocess.run([str(command), "build", "--clean", "--strict", "-f", str(config)], check=True)
        if (ROOT / "site").exists():
            shutil.rmtree(ROOT / "site")
        shutil.copytree(config.parent / "site", ROOT / "site")


if __name__ == "__main__":
    main()
