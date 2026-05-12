# mirrorlane-skill

Agent-friendly website cloning workflow powered by the Mirrorlane SaaS capture
infrastructure.

Mirrorlane keeps the capture engine server-side. Agents receive a clean ZIP and
a sanitized reference package: enough to rebuild a production-grade
Next.js/Tailwind project, without exposing Mirrorlane worker, queue, hosted
preview, or storage internals.

## Quick Start

```bash
npm install -g github:JaideepCherukuri/mirrorlane-skill
export MIRRORLANE_API_KEY=ml_live_...
mirrorlane doctor
mirrorlane capture https://example.com --wait --json
mirrorlane reference <job-id> --out mirrorlane-reference --json
```

The reference command writes:

- `mirrorlane-reference/mirrorlane-reference.json`
- `mirrorlane-reference/<hostname>-clean.zip`

Use the clean ZIP as the primary source artifact. Use the live site and hosted
preview URLs only to resolve ambiguity and validate behavior.

## Agent Skill Locations

- Claude Code: `.claude/skills/clone-website/SKILL.md`
- Codex: `.codex/skills/clone-website/SKILL.md`
- Plain Markdown agents: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`
- Cursor/Windsurf/Continue/Amazon Q/Augment/OpenCode: generated rule files

The source skill is `skill/clone-website/SKILL.md`. Run `npm run sync` after
editing it.

## Starter Project

`starter/` is a small Next.js 16, React 19, TypeScript, Tailwind v4 app intended
as the agent's rebuild target. The agent should transform it into a
componentized clone rather than pasting captured HTML into one page.

## Acceptable Use

Use this only for authorized redesign, migration, QA, competitive research, or
internal prototyping. Do not use it for phishing, deceptive impersonation,
credential harvesting, illegal copying, or bypassing a site's access controls.
