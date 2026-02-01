# claude-sneakpeek Implementation Details

This document provides an exhaustive technical explanation of how claude-sneakpeek implements each feature that differentiates it from official Claude Code. Every feature is traced to its source files with actual code snippets.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [The Feature Flag System](#the-feature-flag-system)
3. [Feature Implementation Details](#feature-implementation-details)
   - [Built-in Sub-Agents (Inherited)](#built-in-sub-agents-inherited)
   - [Custom Sub-Agents (Inherited)](#custom-sub-agents-inherited)
   - [Background/Foreground Agents (Inherited)](#backgroundforeground-agents-inherited)
   - [Agent Tool Restrictions (Inherited)](#agent-tool-restrictions-inherited)
   - [Agent Permission Modes (Inherited)](#agent-permission-modes-inherited)
   - [Dynamic Agent Creation](#dynamic-agent-creation)
   - [Orchestrator (Team Lead)](#orchestrator-team-lead)
   - [Auto-Specialization](#auto-specialization)
   - [Parallel Agent Swarms](#parallel-agent-swarms)
   - [Swarm Execution Reports](#swarm-execution-reports)
   - [Task Management Tools](#task-management-tools)
   - [Agent Messaging (Teammate Mailbox)](#agent-messaging-teammate-mailbox)
4. [Build Pipeline Integration](#build-pipeline-integration)
5. [Verification and Testing](#verification-and-testing)
6. [File Reference Index](#file-reference-index)

---

## Architecture Overview

claude-sneakpeek enables hidden Claude Code features through a **patch-based architecture**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     claude-sneakpeek Architecture                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   User runs: npx @realmikekelly/claude-sneakpeek create ...        │
│                              │                                      │
│                              ▼                                      │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    VariantBuilder                            │  │
│   │  Orchestrates build steps in sequence                        │  │
│   └─────────────────┬───────────────────────────────────────────┘  │
│                     │                                              │
│   ┌─────────────────▼───────────────────────────────────────────┐  │
│   │                    Build Steps                               │  │
│   │                                                              │  │
│   │  1. PrepareDirectoriesStep  - Create folder structure        │  │
│   │  2. InstallNpmStep          - npm install claude-code        │  │
│   │  3. SwarmModeStep           - PATCH cli.js ← KEY STEP        │  │
│   │  4. WriteConfigStep         - settings.json, .claude.json    │  │
│   │  5. BrandThemeStep          - tweakcc/config.json            │  │
│   │  6. TweakccStep             - Apply system prompt overlays   │  │
│   │  7. WrapperStep             - Create launcher script         │  │
│   │  8. ShellEnvStep            - Optional shell integration     │  │
│   │  9. SkillInstallStep        - Install orchestration skill    │  │
│   │  10. FinalizeStep           - Write variant.json metadata    │  │
│   │                                                              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Source File:** `src/core/variant-builder/VariantBuilder.ts`

```typescript
// Build step registration (lines 61-73)
this.steps = [
  new PrepareDirectoriesStep(),
  new InstallNpmStep(),
  ...(NATIVE_MULTIAGENT_SUPPORTED ? [new SwarmModeStep()] : []), // Swarm mode patch
  new WriteConfigStep(),
  new BrandThemeStep(),
  ...(TEAM_MODE_SUPPORTED ? [new TeamModeStep()] : []), // Legacy, deprecated
  new TweakccStep(),
  new WrapperStep(),
  new ShellEnvStep(),
  new SkillInstallStep(),
  new FinalizeStep(),
];
```

---

## The Feature Flag System

### How Claude Code Gates Features

Claude Code 2.1.16+ contains a **gate function** that controls all multi-agent features:

```javascript
// Original gate function in cli.js (minified)
function i8() {
  if (Yz(process.env.CLAUDE_CODE_AGENT_SWARMS)) return !1;  // Check env var
  return xK("tengu_brass_pebble", !1);                       // Check statsig flag
}
```

**What this function does:**
1. `Yz()` - Checks if `CLAUDE_CODE_AGENT_SWARMS` env var is "falsey" (disabled)
2. `xK()` - Calls Anthropic's statsig server to check the `tengu_brass_pebble` feature flag
3. Returns `true` to enable features, `false` to disable

**The problem:** The statsig flag is server-controlled. Normal users can't enable it.

### How claude-sneakpeek Patches It

**Source File:** `src/core/variant-builder/swarm-mode-patch.ts`

```typescript
// The regex pattern that finds the gate function (lines 20-21)
const SWARM_GATE_FN_RE =
  /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\([\w$]+\(process\.env\.CLAUDE_CODE_AGENT_SWARMS\)\)return!1;return\s*[\w$]+\("tengu_brass_pebble",!1\)\}/;

// The patch function (lines 79-107)
export const setSwarmModeEnabled = (
  content: string,
  enable: boolean
): { content: string; changed: boolean; state: SwarmModeState } => {
  // ... validation code ...

  const gate = findSwarmGateFunction(content);
  // ... error handling ...

  // Patch the gate function to always return true
  const patched = content.replace(gate.fullMatch, `function ${gate.fnName}(){return!0}`);

  return { content: patched, changed: true, state: 'enabled' };
};
```

**Before patch:**
```javascript
function i8(){if(Yz(process.env.CLAUDE_CODE_AGENT_SWARMS))return!1;return xK("tengu_brass_pebble",!1)}
```

**After patch:**
```javascript
function i8(){return!0}
```

This simple change enables ALL gated multi-agent features.

---

## Feature Implementation Details

### Built-in Sub-Agents (Inherited)

**Status:** Inherited from Claude Code - no modification needed

**What it provides:**
- Explore agent (Haiku, read-only)
- Plan agent (inherits model, read-only)
- General-purpose agent (inherits model, all tools)
- Bash agent (inherits model, terminal commands)

**How it works:** Built into Claude Code's `cli.js`. When swarm mode is patched, these become part of the broader multi-agent system.

**Source Reference:** Native to `@anthropic-ai/claude-code` package

---

### Custom Sub-Agents (Inherited)

**Status:** Inherited from Claude Code - no modification needed

**What it provides:**
- User can create custom agents via `/agents` command
- Stored in `.claude/agents/` or `~/.claude/agents/`
- Custom system prompts, tool restrictions, permission modes

**How it works:** Native Claude Code feature, available in all variants.

**Source Reference:** Native to `@anthropic-ai/claude-code` package

---

### Background/Foreground Agents (Inherited)

**Status:** Inherited from Claude Code - no modification needed

**What it provides:**
- `run_in_background: true` for concurrent execution
- `run_in_background: false` for blocking execution

**How it works:** Built into Claude Code's Task tool implementation.

**Source Reference:** Native to `@anthropic-ai/claude-code` package

---

### Agent Tool Restrictions (Inherited)

**Status:** Inherited from Claude Code - no modification needed

**What it provides:**
- `tools` field limits which tools an agent can use
- `disallowedTools` field excludes specific tools

**How it works:** Native to Claude Code's subagent system.

**Source Reference:** Native to `@anthropic-ai/claude-code` package

---

### Agent Permission Modes (Inherited)

**Status:** Inherited from Claude Code - no modification needed

**What it provides:**
- `default` - Standard permission checking
- `acceptEdits` - Auto-accept file edits
- `dontAsk` - Auto-deny permission prompts
- `bypassPermissions` - Skip all permission checks
- `plan` - Read-only exploration

**How it works:** Native to Claude Code's permission system.

**Source Reference:** Native to `@anthropic-ai/claude-code` package

---

### Dynamic Agent Creation

**Status:** ENABLED BY PATCH - This is a key differentiator

**What it provides:**
The orchestrator can create specialized agents dynamically during task execution, without pre-configuration.

**How claude-sneakpeek enables it:**

**Source File:** `src/core/variant-builder/swarm-mode-patch.ts`

The `i8()` gate function controls TeammateTool availability:

```javascript
// In cli.js (minified), TeammateTool is conditionally included:
i8() ? [tq2()] : []  // tq2() is the TeammateTool definition
```

When `i8()` returns `true` (after patch), TeammateTool becomes available.

**Source File:** `docs/research/native-multiagent-gates.md` (lines 43-50)

```markdown
| Feature | Code Pattern | Description |
|---------|--------------|-------------|
| **TeammateTool** | `i8()?[tq2()]:[]` | Tool conditionally included in toolset |
```

**TeammateTool Operations:**
- `spawnTeam` - Create a new team/task list
- `approvePlan` - Approve a teammate's plan
- `rejectPlan` - Reject a teammate's plan
- `requestShutdown` - Request teammate shutdown

---

### Orchestrator (Team Lead)

**Status:** ENABLED BY PATCH + SKILL ENHANCEMENT

**What it provides:**
A coordination pattern where the main Claude acts as "Team Lead" that never writes code directly but spawns specialized workers.

**How claude-sneakpeek implements it:**

#### Part 1: Feature Gate Patch

The patch enables the orchestrator's ability to spawn teammates.

**Source File:** `src/core/variant-builder/steps/SwarmModeStep.ts`

```typescript
// SwarmModeStep.ts (lines 42-83)
private patchCli(ctx: BuildContext): void {
  const { state, paths } = ctx;

  // Find cli.js path
  const cliPath = path.join(paths.npmDir, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js');
  const backupPath = `${cliPath}.backup`;

  if (!fs.existsSync(cliPath)) {
    state.notes.push('Warning: cli.js not found, skipping swarm mode patch');
    return;
  }

  // Create backup if not exists
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(cliPath, backupPath);
  }

  // Read cli.js
  const content = fs.readFileSync(cliPath, 'utf8');

  const patchResult = setSwarmModeEnabled(content, true);
  // ... validation and error handling ...

  fs.writeFileSync(cliPath, patchResult.content);

  // Verify patch
  const verifyContent = fs.readFileSync(cliPath, 'utf8');
  if (detectSwarmModeState(verifyContent) !== 'enabled') {
    state.notes.push('Warning: Swarm mode patch verification failed');
    return;
  }

  state.notes.push('Swarm mode enabled successfully');
  state.swarmModeEnabled = true;
}
```

#### Part 2: Orchestration Skill

**Source File:** `src/skills/orchestration/SKILL.md`

The orchestration skill provides the "Iron Law" and behavioral guidelines:

```markdown
## ⚡ The Iron Law: Orchestrate, Don't Execute

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   YOU DO NOT WRITE CODE.  YOU DO NOT RUN COMMANDS.           ║
║   YOU DO NOT EXPLORE CODEBASES.                              ║
║                                                               ║
║   You are the CONDUCTOR. Your agents play the instruments.   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

**Tool Ownership (lines 207-225):**

```markdown
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR uses directly:                                │
│                                                             │
│  • Read (references, guides, agent outputs for synthesis)  │
│  • TaskCreate, TaskUpdate, TaskGet, TaskList               │
│  • AskUserQuestion                                          │
│  • Task (to spawn workers)                                  │
│                                                             │
│  WORKERS use directly:                                      │
│                                                             │
│  • Read (for exploring/implementing), Write, Edit, Bash    │
│  • Glob, Grep, WebFetch, WebSearch, LSP                    │
│  • They CAN see Task* tools but shouldn't manage the graph │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Auto-Specialization

**Status:** ENABLED BY PATCH - Native feature unlocked

**What it provides:**
The orchestrator automatically creates specialized agents based on task requirements:
- QA Tester
- Backend Builder
- Frontend Builder
- Component Builder
- CSS Agent
- API Integrator
- etc.

**How claude-sneakpeek enables it:**

The patch enables ExitPlanMode swarm parameters:

**Source File:** `docs/research/native-multiagent-gates.md` (lines 74-79)

```markdown
### ExitPlanMode Swarm Parameters

When `i8()` returns true, ExitPlanMode accepts:
- `launchSwarm: boolean` - Enable swarm spawning
- `teammateCount: number` - Number of teammates to spawn (1-5)
```

**In cli.js (pattern):**
```javascript
// Swarm spawning is gated
i8() && launchSwarm && teammateCount
```

**Worker Agent Template:**

**Source File:** `src/skills/orchestration/SKILL.md` (lines 229-245)

```markdown
## 📋 Worker Agent Prompt Template

**ALWAYS include this preamble when spawning agents:**

```
CONTEXT: You are a WORKER agent, not an orchestrator.

RULES:
- Complete ONLY the task described below
- Use tools directly (Read, Write, Edit, Bash, etc.)
- Do NOT spawn sub-agents
- Do NOT call TaskCreate or TaskUpdate
- Report your results with absolute file paths

TASK:
[Your specific task here]
```
```

---

### Parallel Agent Swarms

**Status:** ENABLED BY PATCH

**What it provides:**
- Multiple agents working simultaneously on different tasks
- Automatic task distribution
- Parallel execution backends (tmux, iTerm2, in-process)

**How claude-sneakpeek enables it:**

**Source File:** `docs/research/native-multiagent-gates.md` (lines 82-91)

```markdown
### Backend System

Two execution backends for spawning teammates:

1. **In-Process Backend** - Runs teammates in the same process
   - Used in non-interactive sessions
   - Controlled by `--teammate-mode` flag

2. **Pane Backend** - Spawns teammates in terminal panes
   - **tmux** - Primary, works inside or outside tmux sessions
   - **iTerm2** - Native iTerm2 support via `it2` CLI
```

**The orchestration skill encourages parallel execution:**

**Source File:** `src/skills/orchestration/SKILL.md` (lines 591-608)

```markdown
## 🔥 Background Agents Only

```python
# ✅ ALWAYS: run_in_background=True
Task(subagent_type="Explore", prompt="...", run_in_background=True)
Task(subagent_type="general-purpose", prompt="...", run_in_background=True)

# ❌ NEVER: blocking agents (wastes orchestration time)
Task(subagent_type="general-purpose", prompt="...")
```

**Non-blocking mindset:** "Agents are working — what else can I do?"

- Launch more agents
- Update the user on progress
- Prepare synthesis structure
- When notifications arrive → process and continue
```

---

### Swarm Execution Reports

**Status:** ENABLED BY PATCH - Native feature unlocked

**What it provides:**
Upon completion of a swarm task:
- Number of specialized agents used
- Agent roles and responsibilities
- Success/failure status per agent
- Detailed breakdown of what each agent did

**How claude-sneakpeek enables it:**

This is a native feature controlled by the `i8()` gate. When enabled, Claude Code generates execution reports automatically.

**The orchestration skill defines the expected format:**

**Source File:** `src/skills/orchestration/SKILL.md` (lines 624-639)

```markdown
### Milestone Celebrations

When significant work completes, mark the moment:

```
    ╭──────────────────────────────────────╮
    │                                      │
    │  ✨ Phase 1: Complete                │
    │                                      │
    │  • Authentication system live        │
    │  • JWT tokens configured             │
    │  • Login/logout flows working        │
    │                                      │
    │  Moving to Phase 2: User Dashboard   │
    │                                      │
    ╰──────────────────────────────────────╯
```
```

---

### Task Management Tools

**Status:** ENABLED BY PATCH (TaskCreate, TaskUpdate, TaskList, TaskGet)

**What it provides:**
- `TaskCreate` - Create tasks in the work queue
- `TaskUpdate` - Update task status, add comments, set dependencies
- `TaskList` - View all tasks and their status
- `TaskGet` - Get full details of a specific task

**How claude-sneakpeek implements it:**

#### Part 1: The Gate Patch

Task management tools are part of the multi-agent system gated by `i8()`.

#### Part 2: Team Pack Prompts

**Source File:** `src/team-pack/index.ts`

```typescript
// Team pack file mappings (lines 14-21)
export const TEAM_PACK_FILES = [
  { source: 'tasklist.md', target: 'tool-description-tasklist.md' },
  { source: 'taskupdate.md', target: 'tool-description-taskupdate.md' },
  { source: 'task-extra-notes.md', target: 'agent-prompt-task-tool-extra-notes.md' },
  { source: 'task-management-note.md', target: 'system-prompt-task-management-note.md' },
  { source: 'orchestration-skill.md', target: 'system-prompt-orchestration-skill.md' },
  { source: 'skill-tool-override.md', target: 'tool-description-skill.md' },
];
```

**Source File:** `src/team-pack/task-management-note.md`

```markdown
# Task Management (Team Mode Active)

Team Mode is enabled. Use the **Task\*** tools for task management instead of TodoWrite:

| Use This   | Not This               |
| ---------- | ---------------------- |
| TaskCreate | TodoWrite (deprecated) |
| TaskUpdate | TodoWrite (deprecated) |
| TaskList   | TodoWrite (deprecated) |
| TaskGet    | TodoWrite (deprecated) |
```

**Source File:** `src/team-pack/tasklist.md`

```markdown
Use this tool to list all tasks in the task list.

## When to Use This Tool

- To see what tasks are available to work on (status: 'open', no owner, not blocked)
- To check overall progress on the project
- To find tasks that are blocked and need dependencies resolved
- After completing a task, to check for newly unblocked work

## Output

Returns a summary of each task:

- **id**: Task identifier (use with TaskGet, TaskUpdate)
- **subject**: Brief description of the task
- **status**: 'open' or 'resolved'
- **owner**: Agent ID if assigned, empty if available
- **blockedBy**: List of open task IDs that must be resolved first
```

#### Part 3: Toolset Configuration

**Source File:** `src/team-pack/index.ts` (lines 71-119)

```typescript
/**
 * Configure TweakCC toolset to disable TodoWrite for Team Mode
 * Merges blocked tools from the existing default toolset with TodoWrite
 */
export const configureTeamToolset = (configPath: string): boolean => {
  // ... file handling ...

  // Merge existing blocked tools with TodoWrite
  const existingBlockedTools: string[] = existingDefaultToolset?.blockedTools || [];
  const mergedBlockedTools = [...new Set([...existingBlockedTools, 'TodoWrite'])];

  // Create or update team toolset
  const teamToolset = {
    name: 'team',
    allowedTools: '*' as const,
    blockedTools: mergedBlockedTools,
  };

  // ... config update ...

  config.settings.toolsets = toolsets;
  config.settings.defaultToolset = 'team';
  config.settings.planModeToolset = 'team';

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
};
```

This blocks `TodoWrite` and ensures Task* tools are the primary task management interface.

---

### Agent Messaging (Teammate Mailbox)

**Status:** ENABLED BY PATCH - Native feature unlocked

**What it provides:**
Inter-agent messaging system for coordination between teammates.

**How claude-sneakpeek enables it:**

**Source File:** `docs/research/native-multiagent-gates.md` (lines 43-50)

```markdown
| Feature | Code Pattern | Description |
|---------|--------------|-------------|
| **Teammate mailbox** | `i8()?[yw("teammate_mailbox",...)]` | Inter-agent messaging |
```

**In cli.js (pattern):**
```javascript
// Teammate mailbox is gated
i8() ? [yw("teammate_mailbox", ...)] : []
```

When `i8()` returns `true`, the teammate mailbox becomes available, allowing agents to send messages to each other.

---

## Build Pipeline Integration

### SwarmModeStep Execution

**Source File:** `src/core/variant-builder/steps/SwarmModeStep.ts`

```typescript
export class SwarmModeStep implements BuildStep {
  name = 'SwarmMode';

  private shouldEnableSwarmMode(ctx: BuildContext): boolean {
    // Swarm mode is enabled by default unless explicitly disabled
    if (ctx.params.disableSwarmMode === true) return false;
    return true;
  }

  execute(ctx: BuildContext): void {
    if (!this.shouldEnableSwarmMode(ctx)) return;
    ctx.report('Enabling swarm mode...');
    this.patchCli(ctx);
  }

  async executeAsync(ctx: BuildContext): Promise<void> {
    if (!this.shouldEnableSwarmMode(ctx)) return;
    await ctx.report('Enabling swarm mode...');
    this.patchCli(ctx);
  }

  private patchCli(ctx: BuildContext): void {
    // Implementation shown above
  }
}
```

### SwarmModeUpdateStep for Updates

**Source File:** `src/core/variant-builder/update-steps/SwarmModeUpdateStep.ts`

```typescript
export class SwarmModeUpdateStep implements UpdateStep {
  name = 'SwarmMode';

  private shouldEnableSwarmMode(ctx: UpdateContext): boolean {
    // For old variants without swarmModeEnabled, we enable it during update
    if (ctx.meta.swarmModeEnabled === false) return false;
    return true;
  }

  execute(ctx: UpdateContext): void {
    if (!NATIVE_MULTIAGENT_SUPPORTED) return;
    if (!this.shouldEnableSwarmMode(ctx)) return;
    ctx.report('Re-applying swarm mode patch...');
    this.patchCli(ctx);
  }

  // ... similar async implementation ...
}
```

### Metadata Storage

**Source File:** `src/core/variant-builder/steps/FinalizeStep.ts`

```typescript
private finalize(ctx: BuildContext): void {
  // ... setup ...

  // Check if swarm mode was enabled (default: true unless explicitly disabled)
  const swarmModeEnabled = NATIVE_MULTIAGENT_SUPPORTED
    ? Boolean(state.swarmModeEnabled)
    : false;

  const meta: VariantMeta = {
    name: params.name,
    provider: params.providerKey,
    // ... other fields ...
    swarmModeEnabled,  // Stored in variant.json
  };

  writeJson(path.join(paths.variantDir, 'variant.json'), meta);
  state.meta = meta;
}
```

**Source File:** `src/core/types.ts`

```typescript
export interface VariantMeta {
  name: string;
  provider: string;
  // ... other fields ...
  /** Whether swarm mode is enabled (native multi-agent features) */
  swarmModeEnabled?: boolean;
}
```

---

## Verification and Testing

### Unit Tests

**Source File:** `test/unit/swarm-mode-patch.test.ts`

```typescript
describe('swarm-mode-patch', () => {
  // Realistic gate function pattern from Claude Code 2.1.17
  const UNPATCHED_GATE = `function i8(){if(Yz(process.env.CLAUDE_CODE_AGENT_SWARMS))return!1;return xK("tengu_brass_pebble",!1)}`;
  const PATCHED_GATE = `function i8(){return!0}`;

  describe('setSwarmModeEnabled', () => {
    it('patches the gate function to return true', () => {
      const content = makeCliContent(UNPATCHED_GATE);
      const result = setSwarmModeEnabled(content, true);

      assert.strictEqual(result.changed, true);
      assert.strictEqual(result.state, 'enabled');
      assert.ok(result.content.includes('function i8(){return!0}'));
      assert.ok(!result.content.includes('tengu_brass_pebble'));
    });

    it('handles different function names', () => {
      const gateWithDifferentName = `function xY7(){if(Yz(process.env.CLAUDE_CODE_AGENT_SWARMS))return!1;return xK("tengu_brass_pebble",!1)}`;
      const content = `var a=1;${gateWithDifferentName}var b=2;`;
      const result = setSwarmModeEnabled(content, true);

      assert.strictEqual(result.changed, true);
      assert.ok(result.content.includes('function xY7(){return!0}'));
    });
  });
});
```

### Manual Verification Commands

```bash
# Check if swarm gate marker exists (unpatched)
grep -o 'tengu_brass_pebble' ~/.claude-sneakpeek/<variant>/npm/node_modules/@anthropic-ai/claude-code/cli.js

# Should return nothing if patched correctly

# Check for TeammateTool presence
grep -o 'TeammateTool' ~/.claude-sneakpeek/<variant>/npm/node_modules/@anthropic-ai/claude-code/cli.js

# Verify variant metadata
cat ~/.claude-sneakpeek/<variant>/variant.json | grep swarmModeEnabled
# Should show: "swarmModeEnabled": true
```

---

## File Reference Index

| Feature | Primary Source File(s) | Line Numbers |
|---------|------------------------|--------------|
| **Gate Detection** | `src/core/variant-builder/swarm-mode-patch.ts` | 16-70 |
| **Gate Patching** | `src/core/variant-builder/swarm-mode-patch.ts` | 79-107 |
| **Build Step** | `src/core/variant-builder/steps/SwarmModeStep.ts` | 1-85 |
| **Update Step** | `src/core/variant-builder/update-steps/SwarmModeUpdateStep.ts` | 1-93 |
| **Builder Integration** | `src/core/variant-builder/VariantBuilder.ts` | 61-73 |
| **Constants** | `src/core/constants.ts` | 11-19 |
| **Type Definitions** | `src/core/types.ts` | 26-28, 64-65 |
| **Metadata Storage** | `src/core/variant-builder/steps/FinalizeStep.ts` | 33-55 |
| **Orchestration Skill** | `src/skills/orchestration/SKILL.md` | 1-733 |
| **Team Pack** | `src/team-pack/index.ts` | 1-160 |
| **Task Management Note** | `src/team-pack/task-management-note.md` | 1-25 |
| **TaskList Description** | `src/team-pack/tasklist.md` | 1-34 |
| **Research Documentation** | `docs/research/native-multiagent-gates.md` | 1-168 |
| **Unit Tests** | `test/unit/swarm-mode-patch.test.ts` | 1-108 |

---

## Summary

claude-sneakpeek enables hidden Claude Code multi-agent features through a **minimal, surgical patch** to a single gate function in `cli.js`. This single change (`function i8(){return!0}`) unlocks:

1. **TeammateTool** - Dynamic agent spawning
2. **Delegate mode** - Task tool mode options
3. **Swarm spawning** - ExitPlanMode parameters
4. **Teammate mailbox** - Inter-agent messaging
5. **Task teammates** - Task list teammate display

Combined with the **orchestration skill** that provides behavioral guidelines for the Team Lead pattern, claude-sneakpeek transforms Claude Code from a single-agent tool into a powerful multi-agent orchestration platform.

**Key technical insight:** All these features already exist in Claude Code's source. claude-sneakpeek simply changes a `return !1` (false) to `return !0` (true) for a single gate function, and suddenly everything works.
