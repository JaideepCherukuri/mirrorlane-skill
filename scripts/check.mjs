import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "README.md",
  "skill/clone-website/SKILL.md",
  ".claude/skills/clone-website/SKILL.md",
  ".codex/skills/clone-website/SKILL.md",
  "skill/clone-website/scripts/capture-viewports.mjs",
  "skill/clone-website/scripts/pixel-diff.mjs",
  ".claude/skills/clone-website/scripts/capture-viewports.mjs",
  ".claude/skills/clone-website/scripts/pixel-diff.mjs",
  ".codex/skills/clone-website/scripts/capture-viewports.mjs",
  ".codex/skills/clone-website/scripts/pixel-diff.mjs",
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "bin/mirrorlane.mjs",
  "starter/package.json",
];

for (const relativePath of requiredFiles) {
  const filePath = path.join(root, relativePath);
  const stat = await fs.stat(filePath).catch(() => null);

  if (!stat?.isFile()) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

const skill = await fs.readFile(
  path.join(root, "skill/clone-website/SKILL.md"),
  "utf8",
);

for (const phrase of [
  "mirrorlane doctor",
  "mirrorlane capture",
  "mirrorlane reference",
  "clean ZIP",
  "Do not paste a captured HTML document",
]) {
  if (!skill.includes(phrase)) {
    throw new Error(`Skill is missing required phrase: ${phrase}`);
  }
}

console.log("mirrorlane-skill check passed.");
