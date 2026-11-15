"""Give custom assets content-based URLs so HTML never uses stale styles."""
from pathlib import Path
import hashlib
import yaml

root = Path(__file__).resolve().parents[1]
config_path = root / "mkdocs.yml"
config = yaml.safe_load(config_path.read_text())
docs = root / config.get("docs_dir", "docs")
for key in ("extra_css", "extra_javascript"):
    updated = []
    for relative in config.get(key, []):
        if not isinstance(relative, str) or "://" in relative:
            updated.append(relative)
            continue
        source = docs / relative
        content = source.read_bytes()
        digest = hashlib.sha256(content).hexdigest()[:12]
        target = source.with_name(source.stem + "." + digest + source.suffix)
        target.write_bytes(content)
        updated.append(target.relative_to(docs).as_posix())
    config[key] = updated
config_path.write_text(yaml.safe_dump(config, sort_keys=False))
