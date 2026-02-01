# Swarm Mode vs Native Claude Code: A Comparison

This document explains the relationship between claude-sneakpeek's swarm feature and Claude Code's native multi-agent capabilities.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Does Claude Code Have Agent Swarm Features?](#does-claude-code-have-agent-swarm-features)
3. [Key Differences](#key-differences)
4. [Feature Comparison Table](#feature-comparison-table)
5. [Technical Deep Dive](#technical-deep-dive)
6. [How to Invoke the Swarm](#how-to-invoke-the-swarm)
7. [Use Case Recommendations](#use-case-recommendations)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## Executive Summary

**Short answer:** Yes, Claude Code has multi-agent features, but they are **fundamentally different** from claude-sneakpeek's swarm capabilities.

| Aspect | Claude Code (Official) | claude-sneakpeek Swarm |
|--------|------------------------|------------------------|
| **Agent Creation** | Manual pre-configuration | Dynamic on-the-fly creation |
| **Orchestration** | User-directed | AI-directed (Team Lead) |
| **Specialization** | Pre-defined roles | Auto-generated specialists |
| **Availability** | Public | Hidden feature flag |

---

## Does Claude Code Have Agent Swarm Features?

### Yes, But With Limitations

Official Claude Code (version 2.1.16+) includes a comprehensive **sub-agent system** documented at [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents). This system provides:

#### Built-in Sub-Agents

| Agent | Model | Purpose | Tools |
|-------|-------|---------|-------|
| **Explore** | Haiku | Fast codebase search | Read-only |
| **Plan** | Inherits | Research for planning | Read-only |
| **General-purpose** | Inherits | Complex multi-step tasks | All tools |
| **Bash** | Inherits | Terminal commands | Bash |
| **Claude Code Guide** | Haiku | Documentation Q&A | Read |

#### Custom Sub-Agent Creation

Users can create custom sub-agents via:

```bash
# Interactive creation
/agents

# CLI definition
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob"],
    "model": "sonnet"
  }
}'
```

#### What Official Sub-Agents Can Do

- Run in foreground (blocking) or background (concurrent)
- Have isolated context windows
- Use specific tool subsets
- Apply custom permission modes
- Chain together for multi-step workflows

### What Official Sub-Agents CANNOT Do

This is where claude-sneakpeek differs fundamentally:

| Capability | Official Claude Code | claude-sneakpeek |
|------------|---------------------|------------------|
| Create agents dynamically during task | No | Yes |
| Auto-specialize agents based on task | No | Yes |
| Orchestrator decides agent roles | No | Yes |
| Spawn unlimited specialized agents | No | Yes |
| Generate swarm execution reports | No | Yes |

---

## Key Differences

### 1. Static vs Dynamic Agent Creation

**Official Claude Code (Static):**
```
User pre-defines agents → User assigns tasks → Agents execute
```

You must manually create each sub-agent with:
- A name and description
- System prompt
- Tool permissions
- Model selection

**claude-sneakpeek (Dynamic):**
```
User describes goal → Orchestrator analyzes → Orchestrator spawns specialized agents
```

The "Team Lead" orchestrator:
- Reads your task description
- Determines what specialists are needed
- Creates agents on-the-fly with appropriate roles
- Coordinates parallel execution
- Synthesizes results

### 2. User-Directed vs AI-Directed Orchestration

**Official Claude Code:**
- You decide when to use which sub-agent
- You explicitly invoke: "Use the code-reviewer subagent to..."
- Sub-agents cannot spawn other sub-agents

**claude-sneakpeek:**
- The orchestrator decides what agents to create
- You describe the goal: "Build a web frontend for this CLI tool"
- Orchestrator may spawn: QA Tester, Backend Builder, Component Builder, Frontend Builder, etc.

### 3. Specialist Auto-Generation

In the [YouTube demo](https://www.youtube.com/watch?v=eRu5kIYAAz8), when asked to build a web frontend, claude-sneakpeek's orchestrator automatically created:

| Auto-Created Agent | Role |
|-------------------|------|
| Team Lead | Main orchestrator (Claude Code itself) |
| QA Tester | Testing and validation |
| Backend Builder | API server implementation |
| Component Builder | UI component development |
| Frontend Builder | Overall frontend integration |
| CSS Agent | Styling |
| API Integrator | API connection |
| Vite Setup | Build tooling |

**None of these were pre-defined by the user.** The orchestrator created them based on task analysis.

### 4. The Hidden Feature Flag

Claude Code contains dormant code for dynamic swarming, controlled by:

```javascript
// Hidden gate function in cli.js
function i8() {
  if (Yz(process.env.CLAUDE_CODE_AGENT_SWARMS)) return !1;  // env override
  return xK("tengu_brass_pebble", !1);  // statsig flag (default: disabled)
}
```

claude-sneakpeek patches this to:

```javascript
function i8() { return !0; }  // Always enabled
```

This unlocks:
- TeammateTool (dynamic agent spawning)
- Delegate mode for Task tool
- Swarm spawning via ExitPlanMode
- Teammate mailbox/messaging
- Task ownership and claiming

---

## Feature Comparison Table

| Feature | Official Claude Code | claude-sneakpeek |
|---------|---------------------|------------------|
| **Built-in Sub-Agents** | Explore, Plan, General-purpose, Bash | Same (inherited) |
| **Custom Sub-Agents** | Yes, via `/agents` or CLI | Yes (inherited) |
| **Background Agents** | Yes | Yes |
| **Foreground Agents** | Yes | Yes |
| **Agent Tool Restrictions** | Yes | Yes |
| **Agent Permission Modes** | Yes | Yes |
| **Dynamic Agent Creation** | No | Yes |
| **Orchestrator (Team Lead)** | No | Yes |
| **Auto-Specialization** | No | Yes |
| **Parallel Agent Swarms** | Limited (manual fan-out) | Yes (automatic) |
| **Swarm Execution Reports** | No | Yes |
| **Task Management Tools** | TaskCreate, TaskUpdate, TaskList | Same (enabled) |
| **Agent Messaging** | No | Yes (teammate mailbox) |
| **Minimum Version** | 2.1.16+ | 2.1.16+ |
| **Feature Flag** | `tengu_brass_pebble` (disabled) | Patched to enabled |

---

## Technical Deep Dive

### How Official Sub-Agents Work

1. **Configuration-First**: Sub-agents are defined in `.claude/agents/` or `~/.claude/agents/` as Markdown files with YAML frontmatter:

```yaml
---
name: code-reviewer
description: Reviews code for quality
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze code...
```

2. **Explicit Invocation**: Claude delegates based on your request:
   - "Use the code-reviewer subagent to review auth.js"
   - Or Claude matches task to description and delegates automatically

3. **Isolated Context**: Each sub-agent:
   - Gets only its system prompt (not full Claude Code prompt)
   - Has independent context window
   - Returns results to main conversation
   - Cannot spawn other sub-agents

### How claude-sneakpeek Swarm Works

1. **Orchestrator Pattern**: Main Claude acts as "Team Lead":
   - Analyzes the overall task
   - Decomposes into subtasks
   - Creates specialized agents dynamically
   - Coordinates parallel execution

2. **Dynamic Spawning**: When you ask for complex work:
   ```
   "Build a user authentication system with:
   - Registration with email verification
   - Login with JWT tokens
   - Password reset flow"
   ```

   The orchestrator might create:
   - Database Agent (schema design)
   - Auth Middleware Agent (JWT handling)
   - Routes Agent (API endpoints)
   - Email Agent (verification flow)
   - Test Agent (integration tests)

3. **The Iron Law**: The orchestrator follows strict rules:
   - **Never writes code directly**
   - Only coordinates and delegates
   - Uses TaskCreate, TaskUpdate, TaskList, Task tools
   - Workers do the actual implementation

4. **Reporting**: Upon completion:
   - Generates swarm execution report
   - Shows which agents were used
   - Reports success/failure per agent
   - Summarizes what each agent did

---

## How to Invoke the Swarm

### Important: There Is No /swarm Command

Based on research and the [original YouTube demo](https://www.youtube.com/watch?v=eRu5kIYAAz8), the swarm is **NOT** invoked via a slash command like `/swarm`.

### Invocation Methods

#### Method 1: Natural Language (Recommended)

Simply describe a complex task and the orchestrator decides whether to use swarm:

```
Build a complete user management system with:
- User registration with email verification
- Login with JWT tokens
- Password reset via email
- User profile CRUD operations
```

The orchestrator automatically:
1. Recognizes this is complex
2. Breaks it into subtasks
3. Spawns specialized agents

#### Method 2: Explicit Swarm Request

You can explicitly request swarm execution:

```
Create tasks that can be executed by a swarm of sub-agents based on this plan.
```

Then:

```
Execute the tasks using sub-agents.
```

#### Method 3: Ask for Parallel Execution

```
Build these three features in parallel:
1. User registration
2. Login with JWT
3. Password reset flow
```

### What Triggers the Swarm vs Single Agent

| Task Complexity | Behavior |
|-----------------|----------|
| Simple question | Single agent responds |
| Single file edit | Single agent or Explore |
| Multi-file feature | Orchestrator spawns workers |
| Large refactor | Parallel agent swarm |
| Complex investigation | Multiple parallel investigators |
| Code review | Multiple review perspectives |

### Example Prompts That Trigger Swarm

**Feature Development:**
```
Add a complete authentication system to this Express app with JWT, OAuth,
password reset, and role-based access control.
```

**Bug Investigation:**
```
Users can't log in after password reset. This is intermittent.
Investigate from multiple angles and find the root cause.
```

**Code Review:**
```
Review PR #234 comprehensively. This touches payment processing
so I need security, performance, and correctness analysis.
```

**Codebase Understanding:**
```
Help me understand this codebase. I need to know the architecture,
data flow, key patterns, and any gotchas.
```

---

## Use Case Recommendations

### When to Use Official Claude Code Sub-Agents

Best for tasks where you want **predictable, controlled** agent behavior:

- Specific, repeatable workflows
- Enforcing consistent review standards
- Limiting tool access for safety
- Tasks where you know exactly what specialist is needed

### When to Use claude-sneakpeek Swarm

Best for tasks where you want **intelligent, autonomous** task decomposition:

- Complex features with many interdependent parts
- Investigations where multiple perspectives help
- Large projects where manual agent assignment is tedious
- Situations where you don't know what specialists are needed

### Hybrid Approach

You can use both:

1. Create custom sub-agents for your common workflows
2. Let the orchestrator spawn additional specialists as needed
3. The orchestrator can potentially use your pre-defined agents

---

## Frequently Asked Questions

### Q: Is claude-sneakpeek's swarm feature "unofficial"?

**A:** Yes. The feature exists in Claude Code's source code but is disabled by a feature flag (`tengu_brass_pebble`). Anthropic hasn't officially released it, likely due to complexity around integrating dynamic agents with user-defined sub-agents and skills.

### Q: Why is this feature hidden?

**A:** According to research, likely reasons include:
- Complexity of deciding when to use existing vs new agents
- Integration challenges with user's custom sub-agents and skills
- The orchestrator needs extensive training (like Kimi 2.5)
- UX concerns for average users

### Q: Will Anthropic officially release this?

**A:** Unknown. The feature exists and is functional, but there's no official announcement about public release.

### Q: Is there a `/swarm` command?

**A:** **No.** The swarm is invoked through natural language prompts, not a slash command. Ask for complex tasks and the orchestrator decides whether to use swarm automatically.

### Q: Can I use official sub-agents AND swarm mode?

**A:** Yes. claude-sneakpeek inherits all official Claude Code features plus enables the hidden swarm capabilities.

### Q: What Claude Code version is required?

**A:** Version 2.1.16 or higher. This version introduced the task management system that powers multi-agent coordination.

### Q: Is the swarm faster than single-agent work?

**A:** For complex tasks, yes. Multiple specialized agents working in parallel can complete work faster than sequential execution. However, simple tasks don't benefit from swarm overhead.

---

## Sources

- [Official Claude Code Sub-Agents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Official Claude Code Common Workflows](https://code.claude.com/docs/en/common-workflows)
- [YouTube: Secret Claude Code Feature (BetterStack)](https://www.youtube.com/watch?v=eRu5kIYAAz8)
- [Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [claude-sneakpeek Source Code](https://github.com/mikekelly/claude-sneakpeek)

---

## Summary

| Question | Answer |
|----------|--------|
| Does Claude Code have agents? | Yes, built-in and custom sub-agents |
| Does it have dynamic swarming? | No (hidden behind feature flag) |
| What does claude-sneakpeek add? | Enables dynamic orchestrator + auto-specialized agents |
| Is there a /swarm command? | No, use natural language prompts |
| Which is better? | Depends on task - use both approaches |
