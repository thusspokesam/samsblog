"""Integration tests use real Git history and the installed Zensical binary."""
import importlib.util
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("hub_build", ROOT / "scripts/build.py")
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)
ZENSICAL = str(Path(sys.executable).parent / ("zensical.exe" if os.name == "nt" else "zensical"))


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        for name in ("docs", "overrides"):
            shutil.copytree(ROOT / name, self.root / name)
        shutil.copy(ROOT / "mkdocs.yml", self.root / "mkdocs.yml")

    def run_git(self, *args, date=None):
        env = os.environ.copy()
        if date:
            env.update(GIT_AUTHOR_DATE=date, GIT_COMMITTER_DATE=date)
        return subprocess.check_output(["git", "-C", str(self.root), *args],
                                       env=env, stderr=subprocess.DEVNULL, text=True).strip()

    def init_git(self):
        self.run_git("init")
        self.run_git("config", "user.email", "test@example.invalid")
        self.run_git("config", "user.name", "Test fixture")
        self.commit("Initial guides", "2025-01-01T12:00:00+00:00")

    def commit(self, message, date):
        self.run_git("add", "docs")
        self.run_git("commit", "-m", message, date=date)

    def render(self):
        config = build.stage(self.root)
        subprocess.run([ZENSICAL, "build", "--clean", "--strict", "-f", str(config)],
                       check=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        return config.parent / "site"

    def test_add_change_deprecate_remove_one_markdown(self):
        self.init_git()
        path = self.root / "docs/deploy-ops/acceptance-check.md"
        path.write_text('''---
title: Acceptance check
summary: Verify an additional acceptance gate.
section: deploy-ops
type: Procedure
owner: TODO
status: new
order: 25
tags: []
---
# Acceptance check

UnicornTelemetryNeedle is present only in this guide body.
''')
        self.commit("Add one guide", "2025-02-01T12:00:00+00:00")
        site = self.render()
        home = (site / "index.html").read_text()
        section = (site / "deploy-ops/index.html").read_text()
        self.assertIn("8 guides · 2 collections", home)
        self.assertIn("Acceptance check", section)
        self.assertLess(section.index('hub-item-title">Validation'), section.index('hub-item-title">Acceptance'))
        self.assertLess(section.index('hub-item-title">Acceptance'), section.index('hub-item-title">Burn-in'))
        self.assertTrue((site / "deploy-ops/acceptance-check/index.html").exists())
        self.assertIn("UnicornTelemetryNeedle", (site / "search.json").read_text())
        self.assertIn("acceptance-check.md", (site.parent / "mkdocs.yml").read_text())
        meta, _ = build.read_page(site.parent / "docs/index.md")
        self.assertEqual(meta["hub"]["recent"][0]["title"], "Acceptance check")
        self.assertEqual(len(meta["hub"]["recent"]), 5)
        # Rename tracking follows the original commit rather than inventing a date.
        renamed = path.with_name("acceptance-gate.md")
        path.rename(renamed)
        self.commit("Rename guide", "2025-03-01T12:00:00+00:00")
        self.assertIn("2025-03-01", build.last_updated(self.root, "docs/deploy-ops/acceptance-gate.md"))
        renamed.write_text(renamed.read_text().replace("status: new", "status: deprecated"))
        self.commit("Retire guide", "2025-04-01T12:00:00+00:00")
        site = self.render()
        meta, _ = build.read_page(site.parent / "docs/index.md")
        self.assertNotIn("Acceptance check", [p["title"] for p in meta["hub"]["recent"]])
        self.assertIn('class="hub-deprecated"', (site / "deploy-ops/index.html").read_text())
        renamed.unlink()
        site = self.render()
        self.assertIn("7 guides · 2 collections", (site / "index.html").read_text())
        self.assertNotIn("UnicornTelemetryNeedle", (site / "search.json").read_text())
        self.assertFalse((site / "deploy-ops/acceptance-gate/index.html").exists())

    def test_no_git_defaults_and_escaping(self):
        path = self.root / "docs/product-engineering/minimal.md"
        path.write_text('---\nsummary: A <script>alert(1)</script> summary\n---\n# Minimal guide\n\nA body.\n')
        site = self.render()
        home = (site / "index.html").read_text()
        self.assertNotIn('id="recent-title"', home)
        self.assertIn("Update date unavailable", (site / "product-engineering/minimal/index.html").read_text())
        self.assertIn("&lt;script&gt;", (site / "product-engineering/index.html").read_text())
        self.assertNotIn("<script>alert(1)</script>", home)
        item = next(p[0] for p in build.collect(self.root) if p[0]["source"].endswith("minimal.md"))
        self.assertEqual((item["owner"], item["status"], item["order"], item["type"]),
                         ("TODO", "draft", 1000, "Guide"))
        self.assertFalse(item["updated"])

    def test_shallow_history_is_not_used(self):
        self.init_git()
        self.root.joinpath('.git/shallow').write_text(self.run_git('rev-parse', 'HEAD') + '\n')
        self.assertFalse(build.git_available(self.root))
        self.assertTrue(all(not item["updated"] for item, _, _ in build.collect(self.root)))

    def test_invalid_metadata_fails_before_build(self):
        path = self.root / "docs/deploy-ops/bad.md"
        for front in ("order: nope", "status: ready", "section: unknown", "tags: string", "title: <script>bad</script>"):
            path.write_text(f"---\n{front}\n---\n# Bad guide\n")
            with self.subTest(front=front), self.assertRaises(ValueError):
                build.collect(self.root)


if __name__ == "__main__":
    unittest.main()
