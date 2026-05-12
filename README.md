# Mirrorlane Skill

Capture once with Mirrorlane. Rebuild with your coding agent.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)
![Supported agents](https://img.shields.io/badge/agents-Claude%20Code%20%7C%20Codex%20%7C%20Cursor%20%7C%20Copilot%20%7C%20Windsurf-blue.svg)

Mirrorlane Skill is a portable agent workflow and CLI for reverse engineering public sites into a componentized, production-grade Next.js/Tailwind rebuild.
It gives AI coding agents a clean reference package, strict
pixel-parity instructions, viewport diff tooling, and platform-specific rule
files for the major coding agents.

The public skill is named `mirrorlane-clone`.

## What You Get

- `mirrorlane` CLI with API-key authentication.
- `mirrorlane-clone` agent skill for website cloning with Mirrorlane artifacts.
- A starter Next.js 16, React 19, TypeScript, and Tailwind v4 project.
- Installable instructions for Claude Code, Codex, Cursor, Windsurf, Continue,
  GitHub Copilot, Gemini CLI, Amazon Q, Augment, and OpenCode.
- Screenshot and pixel-diff helper scripts for parity validation.
- A workflow that makes the agent iterate until the rebuild matches the live
  site and Mirrorlane reference across desktop, tablet, and mobile.

## Quick Start

### 1. Create a Mirrorlane API Key

Sign in to the Mirrorlane dashboard and create an API key from the API keys
interface.

Default API endpoint:

```text
https://mirrorlane.jaideepch.com
```

You can override it with `MIRRORLANE_API_URL` if you are using a different
Mirrorlane deployment.

### 2. Install the CLI

Install directly from GitHub:

```bash
npm install -g github:JaideepCherukuri/mirrorlane-skill
```

Or clone the repo for local development:

```bash
git clone https://github.com/JaideepCherukuri/mirrorlane-skill.git
cd mirrorlane-skill
npm install
npm link
```

### 3. Authenticate

On first run, Mirrorlane prompts automatically:

```bash
mirrorlane
```

```text
mirrorlane cli
Capture, mirror, and rebuild websites with AI agents

Welcome! To get started, authenticate with your Mirrorlane account.

  1. Login with browser (recommended)
  2. Enter API key manually

Tip: You can also set MIRRORLANE_API_KEY environment variable

Enter choice [1/2]:
```

Browser login:

```bash
mirrorlane login
mirrorlane login --browser
```

Direct API key login:

```bash
mirrorlane login --api-key ml_live_...
```

Environment variable on macOS or Linux:

```bash
export MIRRORLANE_API_KEY="ml_live_..."
```

Environment variable on Windows PowerShell:

```powershell
$env:MIRRORLANE_API_KEY = "ml_live_..."
```

Per-command API key:

```bash
mirrorlane capture https://example.com --api-key ml_live_... --wait
```

Verify the CLI can reach Mirrorlane:

```bash
mirrorlane auth --json
```

### 4. Capture a Site

```bash
mirrorlane capture https://example.com --wait --timeout 1200 --poll-interval 3 --json
```

The command returns a Mirrorlane job id. Download the agent reference package:

```bash
mirrorlane reference <job-id> --out docs/mirrorlane/example.com --json
```

The reference command writes:

```text
docs/mirrorlane/example.com/
+-- mirrorlane-reference.json
`-- example.com-clean.zip
```

Agents should use the clean ZIP as the primary reconstruction source and use
the live site plus Mirrorlane preview URLs to resolve ambiguity and validate
behavior.

## Install the Agent Skill

### Agent Skills Installer

For agents that support the Vercel Agent Skills installer:

```bash
npx skills add https://github.com/JaideepCherukuri/mirrorlane-skill --skill mirrorlane-clone
```

The install name is the skill frontmatter name:

```text
mirrorlane-clone
```

### Claude Code

Project-local install:

```bash
git clone https://github.com/JaideepCherukuri/mirrorlane-skill.git
cd mirrorlane-skill
claude --chrome
/mirrorlane-clone https://example.com
```

Global manual install:

```bash
mkdir -p ~/.claude/skills
cp -R .claude/skills/mirrorlane-clone ~/.claude/skills/mirrorlane-clone
```

Restart Claude Code after a global install.

### Codex

Project-local install:

```bash
git clone https://github.com/JaideepCherukuri/mirrorlane-skill.git
cd mirrorlane-skill
codex
```

Then ask:

```text
Use the mirrorlane-clone skill to clone https://example.com with Mirrorlane.
```

Global manual install on macOS or Linux:

```bash
mkdir -p ~/.codex/skills
cp -R .codex/skills/mirrorlane-clone ~/.codex/skills/mirrorlane-clone
```

Global manual install on Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item -Recurse -Force ".codex\skills\mirrorlane-clone" "$env:USERPROFILE\.codex\skills\mirrorlane-clone"
```

Restart Codex after a global install. Some Codex builds expose skills through
natural-language invocation rather than slash commands, so use the explicit
prompt above if `/mirrorlane-clone` is not available.

### Cursor, Windsurf, Continue, Copilot, Gemini, Amazon Q, Augment, OpenCode

Open this repository, or copy the matching instruction file into your target
project:

| Agent | Instruction file |
| --- | --- |
| Cursor | `.cursor/rules/mirrorlane-clone.mdc` |
| Windsurf | `.windsurf/rules/mirrorlane-clone.md` |
| Continue | `.continue/rules/mirrorlane-clone.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Amazon Q | `.amazonq/rules/mirrorlane-clone.md` |
| Augment | `.augment/rules/mirrorlane-clone.md` |
| OpenCode | `opencode/mirrorlane-clone.md` |
| Generic agents | `AGENTS.md` |

## Recommended Agent Prompt

```text
Use the mirrorlane-clone skill. Clone https://example.com with Mirrorlane.
If needed, run mirrorlane login first. Use the Mirrorlane CLI to capture the
site, download the reference package, extract the clean ZIP, build a
componentized Next.js/Tailwind project, and iterate with screenshot diffs until
desktop, tablet, and mobile are under 1% pixel mismatch.
```

For Claude Code installations where the slash command is available:

```text
/mirrorlane-clone https://example.com
```

## How the Workflow Works

1. **Authenticate** with `mirrorlane auth --json`.
2. **Capture** the target URL with `mirrorlane capture <url> --wait --json`.
3. **Download references** with `mirrorlane reference <job-id> --out ...`.
4. **Extract the clean ZIP** into the project research folder.
5. **Map clean ZIP URLs to local assets** so captured fonts, images, videos,
   SVGs, and CSS are served from the generated app whenever Mirrorlane captured
   them locally.
6. **Inspect live, preview, and clean artifacts** across desktop, tablet, and
   mobile viewports.
7. **Port exact DOM/CSS behavior first**, then refactor into maintainable
   Next.js components.
8. **Validate with screenshots and pixel diffs** against the live site and
   Mirrorlane reference.
9. **Iterate from root causes** until the clone passes the parity gate.

The skill is intentionally strict: agents should not paste one giant captured
HTML document as the final result. The expected output is a development-friendly
Next.js project with reusable components, organized assets, typed code, and
repeatable validation.

## CLI Reference

```bash
mirrorlane auth [--json] [--api-url <url>]
mirrorlane login [--browser] [--api-key <key>] [--api-url <url>]
mirrorlane logout
mirrorlane capture <url> [--wait] [--timeout <seconds>] [--poll-interval <seconds>] [--json]
mirrorlane status <job-id> [--json]
mirrorlane download <job-id> --format clean|raw|deployable --out <file> [--json]
mirrorlane reference <job-id> --out <directory> [--no-clean-zip] [--json]
```

Environment variables:

| Variable | Required | Description |
| --- | --- | --- |
| `MIRRORLANE_API_KEY` | No | API key generated in the Mirrorlane dashboard. Overrides stored login. |
| `MIRRORLANE_API_URL` | No | API base URL. Defaults to `https://mirrorlane.jaideepch.com`. |

Credential priority:

1. `--api-key` passed to a command.
2. `MIRRORLANE_API_KEY`.
3. Stored login from `mirrorlane login`.

Stored credentials live at `~/.mirrorlane/config.json`.

## Supported Platforms

| Platform | Status | Invocation |
| --- | --- | --- |
| Claude Code | Recommended | `/mirrorlane-clone <url>` or natural-language prompt |
| Codex | Supported | `Use the mirrorlane-clone skill to clone <url>` |
| Cursor | Supported | Open repo or copy `.cursor/rules/mirrorlane-clone.mdc` |
| Windsurf | Supported | Open repo or copy `.windsurf/rules/mirrorlane-clone.md` |
| Continue | Supported | Open repo or copy `.continue/rules/mirrorlane-clone.md` |
| GitHub Copilot | Supported | Open repo with `.github/copilot-instructions.md` |
| Gemini CLI | Supported | Open repo with `GEMINI.md` |
| Amazon Q | Supported | Open repo or copy `.amazonq/rules/mirrorlane-clone.md` |
| Augment | Supported | Open repo or copy `.augment/rules/mirrorlane-clone.md` |
| OpenCode | Supported | Open repo or copy `opencode/mirrorlane-clone.md` |

## Project Structure

```text
mirrorlane-skill/
+-- bin/mirrorlane.mjs                     # CLI entrypoint
+-- lib/cli/                               # CLI API, args, and reference writers
+-- skill/mirrorlane-clone/                # Source skill
+-- skills/mirrorlane-clone/               # Installer-compatible skill copy
+-- .claude/skills/mirrorlane-clone/       # Claude Code skill
+-- .codex/skills/mirrorlane-clone/        # Codex skill
+-- .cursor/rules/                         # Cursor rules
+-- .windsurf/rules/                       # Windsurf rules
+-- .continue/rules/                       # Continue rules
+-- .github/copilot-instructions.md        # GitHub Copilot instructions
+-- starter/                               # Next.js/Tailwind rebuild target
+-- scripts/sync-skills.mjs                # Regenerates platform copies
`-- scripts/check.mjs                      # Repo validation
```

## Development

```bash
npm install
npm run sync
npm run check
```

Edit the source skill here:

```text
skill/mirrorlane-clone/SKILL.md
```

Then regenerate all platform-specific copies:

```bash
npm run sync
```

## Acceptable Use

Mirrorlane Skill is for authorized rebuilds, migrations, QA, competitive
research, design audits, and internal prototyping. Do not use it for phishing,
deceptive impersonation, credential harvesting, bypassing access controls,
illegal scraping, or violating a site's terms.

Respect brand assets, copyrighted content, robots policies, and customer data.
Only clone websites you own, have permission to inspect, or are legally allowed
to analyze.

## License and Attribution

This repository is MIT licensed. 
