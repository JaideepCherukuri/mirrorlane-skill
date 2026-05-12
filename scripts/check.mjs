import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "README.md",
  "skill/mirrorlane-clone/SKILL.md",
  "skills/mirrorlane-clone/SKILL.md",
  ".claude/skills/mirrorlane-clone/SKILL.md",
  ".codex/skills/mirrorlane-clone/SKILL.md",
  "skill/mirrorlane-clone/scripts/capture-viewports.mjs",
  "skill/mirrorlane-clone/scripts/pixel-diff.mjs",
  "skills/mirrorlane-clone/scripts/capture-viewports.mjs",
  "skills/mirrorlane-clone/scripts/pixel-diff.mjs",
  ".claude/skills/mirrorlane-clone/scripts/capture-viewports.mjs",
  ".claude/skills/mirrorlane-clone/scripts/pixel-diff.mjs",
  ".codex/skills/mirrorlane-clone/scripts/capture-viewports.mjs",
  ".codex/skills/mirrorlane-clone/scripts/pixel-diff.mjs",
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
  path.join(root, "skill/mirrorlane-clone/SKILL.md"),
  "utf8",
);
const readme = await fs.readFile(path.join(root, "README.md"), "utf8");

for (const phrase of [
  "name: mirrorlane-clone",
  "mirrorlane auth",
  "mirrorlane capture",
  "mirrorlane reference",
  "clean ZIP",
  "Do not paste a captured HTML document",
]) {
  if (!skill.includes(phrase)) {
    throw new Error(`Skill is missing required phrase: ${phrase}`);
  }
}

for (const forbiddenPhrase of ["clone" + "-website", "mirrorlane " + "doctor"]) {
  if (skill.includes(forbiddenPhrase) || readme.includes(forbiddenPhrase)) {
    throw new Error(`Found legacy public phrase: ${forbiddenPhrase}`);
  }
}

console.log("mirrorlane-skill check passed.");
