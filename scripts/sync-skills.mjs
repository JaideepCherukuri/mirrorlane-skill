import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "skill", "clone-website", "SKILL.md");
const body = await fs.readFile(source, "utf8");

const targets = [
  [".claude/skills/clone-website/SKILL.md", body],
  [".codex/skills/clone-website/SKILL.md", body],
  ["AGENTS.md", wrapPlain("AGENTS", body)],
  ["CLAUDE.md", wrapPlain("Claude Code", body)],
  ["GEMINI.md", wrapPlain("Gemini", body)],
  [".cursor/rules/mirrorlane-clone.mdc", wrapRule("Cursor", body)],
  [".windsurf/rules/mirrorlane-clone.md", wrapRule("Windsurf", body)],
  [".continue/rules/mirrorlane-clone.md", wrapRule("Continue", body)],
  [".amazonq/rules/mirrorlane-clone.md", wrapRule("Amazon Q", body)],
  [".augment/rules/mirrorlane-clone.md", wrapRule("Augment", body)],
  [".github/copilot-instructions.md", wrapRule("GitHub Copilot", body)],
  ["opencode/mirrorlane-clone.md", wrapRule("OpenCode", body)],
];

for (const [target, content] of targets) {
  const filePath = path.join(root, target);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

console.log(`Synced ${targets.length} skill targets.`);

function wrapPlain(agentName, content) {
  return `# Mirrorlane Clone Website Instructions for ${agentName}

${stripFrontmatter(content)}
`;
}

function wrapRule(agentName, content) {
  return `# Mirrorlane Clone Website Rule (${agentName})

Apply these instructions when rebuilding a website from Mirrorlane artifacts.

${stripFrontmatter(content)}
`;
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\s*/, "").trim();
}
