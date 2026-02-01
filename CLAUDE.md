# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

```bash
npm install          # Install dependencies
npm run dev          # Run CLI from TypeScript sources (e.g., npm run dev -- create --provider zai)
npm run tui          # Launch TUI wizard
npm test             # Run all tests (Node test runner)
npm run typecheck    # TypeScript check without emit
npm run bundle       # Build dist/claude-sneakpeek.mjs
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Running Specific Tests

```bash
npm test -- --test-name-pattern="E2E"      # E2E tests only
npm test -- --test-name-pattern="TUI"      # TUI tests only
npm test -- --test-name-pattern="creation" # Single test pattern
```

## What This Project Does

claude-sneakpeek creates isolated Claude Code variants that unlock feature-flagged capabilities (swarm mode, delegate mode). Each variant has its own npm install, config directory, and wrapper script—completely separate from any global Claude Code installation.

## Architecture Overview

**Three entry points:**
- `src/cli/index.ts` — CLI commands (create, update, remove, doctor, quick, list, tweak, tasks)
- `src/tui/app.tsx` — Ink-based TUI wizard launched with `--tui` or interactively
- `src/core/index.ts` — Public API (`createVariant`, `updateVariant`, `listVariants`, etc.)

**Step-based variant building:**
Variants are created through sequential build steps in `src/core/variant-builder/steps/`. Order matters:
PrepareDirectories → InstallNpm → WriteConfig → BrandTheme → Tweakcc → Wrapper → ShellEnv → SkillInstall → Finalize

**Provider system:**
- `src/providers/index.ts` — Provider templates (zai, minimax, openrouter, ccrouter, mirror, custom)
- `src/brands/*.ts` — TweakCC brand presets with themes and blocked tool lists

**Prompt customization:**
- `src/core/prompt-pack/providers/*.ts` — Per-provider system prompt overlays
- Applied via TweakCC to `tweakcc/system-prompts/` in each variant

## Runtime Variant Layout

```
~/.claude-sneakpeek/<variant>/
├── config/
│   ├── settings.json       # Env vars (API keys, base URLs, model defaults)
│   ├── .claude.json        # Onboarding state, MCP servers, API key approvals
│   └── skills/             # Installed skills
├── tweakcc/
│   ├── config.json         # Brand preset + theme + toolsets
│   └── system-prompts/     # Prompt overlays
├── npm/
│   └── node_modules/@anthropic-ai/claude-code/cli.js
└── variant.json            # Variant metadata
```

Wrapper scripts live at `~/.local/bin/<variant>` (macOS/Linux) or `~/.claude-sneakpeek/bin/<variant>.cmd` (Windows).

## Coding Conventions

- TypeScript + ESM (no CommonJS)
- 2-space indent, single quotes, semicolons
- Tests: `*.test.ts` files in `test/` mirroring `src/` structure

## Key Files for Common Tasks

| Task | Files to Modify |
|------|-----------------|
| Add new provider | `src/providers/index.ts` |
| Add brand theme | `src/brands/*.ts`, `src/brands/index.ts` |
| Add blocked tools | `src/brands/zai.ts` or `minimax.ts` |
| Add prompt overlay | `src/core/prompt-pack/providers/*.ts` |
| Add build step | `src/core/variant-builder/steps/` |
| Add TUI screen | `src/tui/screens/`, `src/tui/app.tsx`, `src/tui/router/routes.ts` |
| Add CLI command | `src/cli/commands/`, `src/cli/index.ts` |

## Detailed Reference

For complete documentation including provider auth modes, debugging commands, and all configuration options, see @AGENTS.md

For user and developer guides, see:
- `docs/QUICK-START.md` — Quick start with 10+ use cases
- `docs/AGENT-SWARM-GUIDE.md` — Complete guide to multi-agent swarm mode with 6 detailed use cases
- `docs/USER-GUIDE.md` — Complete user documentation
- `docs/DEVELOPER-GUIDE.md` — Developer onboarding and contribution guide
- `docs/ARCHITECTURE-DEEP-DIVE.md` — Technical architecture details
