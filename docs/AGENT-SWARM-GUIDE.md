# Agent Swarm Guide

A comprehensive guide to using claude-sneakpeek's agent swarm feature — the ability to have multiple AI agents work together in parallel on complex tasks.

---

## Table of Contents

1. [What is Agent Swarm?](#what-is-agent-swarm)
2. [How It Works (Simple Explanation)](#how-it-works-simple-explanation)
3. [Prerequisites](#prerequisites)
4. [Installation Step-by-Step](#installation-step-by-step)
5. [Your First Swarm Task](#your-first-swarm-task)
6. [How to Invoke the Swarm](#how-to-invoke-the-swarm)
7. [Understanding What You See](#understanding-what-you-see)
8. [Use Case 1: Building a Complete Feature](#use-case-1-building-a-complete-feature)
9. [Use Case 2: Debugging a Complex Bug](#use-case-2-debugging-a-complex-bug)
10. [Use Case 3: Comprehensive Code Review](#use-case-3-comprehensive-code-review)
11. [Use Case 4: Understanding a New Codebase](#use-case-4-understanding-a-new-codebase)
12. [Use Case 5: Database Migration](#use-case-5-database-migration)
13. [Use Case 6: Full Test Suite with Fixes](#use-case-6-full-test-suite-with-fixes)
14. [Tips for Best Results](#tips-for-best-results)
15. [Troubleshooting](#troubleshooting)
16. [Glossary](#glossary)

---

## What is Agent Swarm?

### The Problem: Working Alone is Slow

Imagine you ask an AI assistant to "build a complete authentication system" for your application. With a traditional single-agent approach, the AI would:

1. Research your codebase
2. Design the solution
3. Implement the database schema
4. Implement the API routes
5. Build the middleware
6. Create the frontend components
7. Write tests
8. Wire everything together

This happens **sequentially** — one step at a time. It's slow, and if something goes wrong late in the process, it's hard to recover.

### The Solution: A Team of Specialized Workers

Agent swarm changes this completely. Instead of one AI doing everything sequentially, you get a **team of specialized AI agents** working **in parallel**:

```
                    ┌─────────────────────┐
                    │                     │
  Your Request ───► │   TEAM LEAD         │ ◄─── You talk to this one
                    │   (Orchestrator)    │
                    │                     │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  Worker A   │  │  Worker B   │  │  Worker C   │
    │ (Database)  │  │   (API)     │  │ (Frontend)  │
    └─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         │     All working at the        │
         │       same time!              │
         │               │               │
         ▼               ▼               ▼
    ┌─────────────────────────────────────────┐
    │         Combined Result                 │
    └─────────────────────────────────────────┘
```

**Key benefits:**

- **Faster**: Multiple agents work simultaneously
- **Specialized**: Each agent focuses on what it does best
- **Thorough**: More angles covered, better results
- **Resilient**: If one approach fails, others can compensate

### Why This Is Hidden in Claude Code

Anthropic built this feature into Claude Code but hasn't officially released it yet. It's controlled by a "feature flag" called `tengu_brass_pebble` — a switch that turns features on or off. claude-sneakpeek flips that switch to "on," giving you access to the swarm capabilities.

**Version Information:**
- The native multi-agent/swarm feature was introduced in **Claude Code 2.1.16** (released early 2025)
- This version added the "new task management system, including new capabilities like dependency tracking" per the [official CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- claude-sneakpeek automatically installs a compatible Claude Code version with swarm enabled

---

## How It Works (Simple Explanation)

### The Two Roles

When you use the swarm feature, there are two types of AI agents:

#### 1. The Orchestrator (Team Lead)

This is the main Claude you talk to. It:
- Understands your request
- Breaks it into smaller tasks
- Decides which workers to create
- Assigns work to workers
- Monitors progress
- Combines results into a final answer

**The Orchestrator NEVER writes code itself.** It's like a project manager — it coordinates, but workers do the actual implementation.

#### 2. Workers (Spawned Agents)

These are specialized agents created by the orchestrator. They:
- Focus on one specific task
- Use tools directly (reading files, writing code, running commands)
- Report results back to the orchestrator
- Disappear when their task is complete

Workers are created "on the fly" based on what's needed. The orchestrator might create:
- A "Database Expert" to design schemas
- An "API Builder" to create endpoints
- A "Frontend Developer" to build UI components
- A "QA Tester" to write tests

### The Flow

```
1. You describe what you want
         │
         ▼
2. Orchestrator analyzes and plans
         │
         ▼
3. Orchestrator creates tasks (TaskCreate)
         │
         ▼
4. Orchestrator spawns worker agents (Task tool)
   ┌─────┼─────┐
   │     │     │
   ▼     ▼     ▼
 Worker Worker Worker (all working in parallel)
   │     │     │
   └─────┼─────┘
         │
         ▼
5. Results come back (notifications)
         │
         ▼
6. Orchestrator combines results and reports to you
```

---

## Prerequisites

Before using agent swarm, you need:

### Claude Code Version Compatibility

The swarm feature requires **Claude Code 2.1.16 or higher**. This is handled automatically by claude-sneakpeek — when you create a variant, it installs a compatible version with swarm capabilities enabled.

**Why does version matter?**
- Version 2.1.16 introduced the task management system that powers multi-agent coordination
- Earlier versions don't have the `TaskCreate`, `TaskUpdate`, `TaskList` tools needed for swarm
- claude-sneakpeek patches the feature gate (`tengu_brass_pebble`) to enable these hidden capabilities

### 1. Node.js 18 or Higher

Check if installed:
```bash
node --version
```

Should show `v18.x.x` or higher. If not installed or too old:

**Windows:**
1. Go to https://nodejs.org
2. Download the LTS version
3. Run the installer
4. Restart your terminal

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. A Terminal/Command Line

- **Windows**: Command Prompt, PowerShell, or Windows Terminal
- **macOS**: Terminal or iTerm2
- **Linux**: Any terminal emulator

### 3. A Project to Work On (Optional)

The swarm works best with an actual codebase. You can:
- Use an existing project
- Create a new empty folder for testing
- Clone an open-source project to experiment with

---

## Installation Step-by-Step

### Step 1: Install claude-sneakpeek

Open your terminal and run:

```bash
npx @realmikekelly/claude-sneakpeek quick --name claudesp
```

**What this does:**
1. Downloads claude-sneakpeek
2. Downloads Claude Code with swarm features enabled
3. Creates a command called `claudesp` that you can run

**Expected output:**
```
Creating variant 'claudesp' with provider 'mirror'...

✓ Preparing directories
✓ Installing Claude Code
✓ Writing configuration
✓ Applying theme
✓ Enabling swarm mode
✓ Creating wrapper script

Done! Run 'claudesp' to launch.
```

### Step 2: Add to PATH (First Time Only)

The `claudesp` command needs to be findable by your terminal.

**macOS/Linux:**
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

If you use bash instead of zsh:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

**Windows:**
Usually automatic. If `claudesp` isn't recognized, restart your terminal.

### Step 3: Verify Installation

```bash
claudesp --help
```

Should show Claude Code help text.

### Step 4: Navigate to a Project

```bash
cd /path/to/your/project
```

Or create a test project:
```bash
mkdir ~/test-swarm-project
cd ~/test-swarm-project
```

### Step 5: Launch Claude with Swarm

```bash
claudesp
```

You should see Claude Code start up. The swarm features are now available!

---

## Your First Swarm Task

Let's try a simple task to see the swarm in action.

### Step 1: Launch Claude

```bash
cd ~/your-project
claudesp
```

### Step 2: Give a Multi-Part Task

Type this (or similar):

```
Create a simple Express.js server with:
1. A health check endpoint at /health
2. A users endpoint at /api/users that returns mock data
3. Basic error handling middleware
4. A README explaining how to run it
```

### Step 3: Watch the Swarm

You'll see something like:

```
Let me set this up for you.

─── ◈ Orchestrating ── Express Server Setup ──

[Progress indicators appear]
[Multiple agents start working]
```

If you see a "team" view, press the down arrow to see all active agents:

```
Team: 4 agents
├── Team Lead (orchestrator)
├── API Builder (implementing endpoints)
├── Middleware Expert (error handling)
└── Documentation Writer (README)
```

### Step 4: See the Results

When complete, you'll get:
- All the files created
- A summary of what was done
- Instructions for next steps

```
✓ Express Server Complete

Created:
• src/index.js - Main server with routes
• src/middleware/errorHandler.js - Error handling
• src/routes/users.js - Users endpoint
• README.md - Setup instructions

To run:
  npm install
  npm start

Then visit http://localhost:3000/health

─── ◈ Complete ──────────────────────────
```

---

## How to Invoke the Swarm

The swarm activates automatically for complex tasks. Here's how to use it effectively:

### Important: There Is No /swarm Command

A common misconception is that you need to type `/swarm` to activate swarm mode. **This is not true.** The swarm is invoked through **natural language prompting**, not a slash command.

Based on the [original YouTube demo](https://www.youtube.com/watch?v=eRu5kIYAAz8), the correct approach is:

1. Describe a complex task naturally
2. Optionally mention "sub-agents" or "swarm" in your request
3. The orchestrator decides whether to use swarm based on task complexity

### Method 1: Just Ask Naturally

The orchestrator automatically decides when to use multiple agents:

```
"Build a user authentication system"
```

The orchestrator will:
1. Recognize this is complex
2. Break it into subtasks
3. Spawn workers as needed

### Method 2: Explicitly Request Sub-Agent Execution

From the [YouTube demo](https://www.youtube.com/watch?v=eRu5kIYAAz8), you can explicitly request swarm execution:

**Step 1: Create tasks**
```
Read plan.md and create tasks that can be executed by a swarm of sub-agents.
```

**Step 2: Execute with agents**
```
Execute the tasks using sub-agents.
```

This two-step approach explicitly triggers the orchestrator to spawn specialized agents.

### Method 3: Request Parallel Work

If you want to ensure parallel execution:

```
"Build these three features in parallel:
1. User registration
2. Login with JWT
3. Password reset flow"
```

### Method 4: Describe the Outcome, Not the Process

**Good** (lets orchestrator decide how):
```
"Add dark mode to this React app with a toggle in the header"
```

**Less Good** (too prescriptive):
```
"First read all CSS files, then create variables, then make a toggle component, then wire it up"
```

### Method 5: Complex Analysis Tasks

For research/analysis that benefits from multiple perspectives:

```
"Review the security of this authentication module from multiple angles"
```

This spawns agents that check:
- SQL injection vulnerabilities
- XSS risks
- Authentication bypass possibilities
- Token handling issues

### What Triggers the Swarm

| Task Type | Swarm Behavior |
|-----------|----------------|
| Simple question | Single agent responds directly |
| Code lookup | Single Explore agent |
| Multi-file feature | Multiple parallel workers |
| Bug investigation | Parallel diagnosis agents |
| Code review | Multiple review perspectives |
| Large refactor | Parallel transformation agents |

---

## Understanding What You See

### The Orchestrator Signature

Every response ends with a status line:

```
─── ◈ Orchestrating ─────────────────────────────
```

With context:
```
─── ◈ Orchestrating ── 4 agents working ─────────
```

Or phase info:
```
─── ◈ Orchestrating ── Phase 2: Implementation ──
```

On completion:
```
─── ◈ Complete ──────────────────────────────────
```

### Team View

If multiple agents are active, you may see a team panel:

```
Team: 5 agents
├── Team Lead
├── QA Tester - searching for patterns
├── Backend Builder - reading files
├── Component Builder - writing code
└── Frontend Builder - implementing UI
```

Press **Down Arrow** to expand and see what each agent is doing.

### Progress Updates

The orchestrator keeps you informed:

```
"Looking at this from several angles..."

"Got a few threads running on this..."

"Early results coming in. Looking good."

"Pulling it all together now..."
```

### Milestone Celebrations

When significant work completes:

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

---

## Use Case 1: Building a Complete Feature

### Scenario

You have an existing Express.js backend and want to add a complete user management system.

### What You Say

```
Add a complete user management system to this Express app:
- User registration with email verification
- Login with JWT tokens
- Password reset via email
- User profile CRUD operations
- Role-based access control (admin, user, guest)
```

### What Happens Behind the Scenes

**Phase 1: Research (Parallel)**
```
┌────────────────────────────────────────────────────┐
│  Orchestrator creates exploration tasks:            │
│                                                    │
│  Agent A ──► "Find existing auth patterns"         │
│  Agent B ──► "Analyze database models"             │
│  Agent C ──► "Check email configuration"           │
│  Agent D ──► "Find route structure"                │
│                                                    │
│  All 4 run simultaneously (30 seconds vs 2 min)   │
└────────────────────────────────────────────────────┘
```

**Phase 2: Planning (Sequential)**
```
┌────────────────────────────────────────────────────┐
│  Orchestrator synthesizes findings                  │
│                                                    │
│  Plan Agent ──► "Design architecture based on      │
│                  what we found"                    │
└────────────────────────────────────────────────────┘
```

**Phase 3: Implementation (Parallel)**
```
┌────────────────────────────────────────────────────┐
│  Multiple workers build different parts:           │
│                                                    │
│  Agent A ──► User model + database schema          │
│  Agent B ──► Auth middleware (JWT verification)    │
│  Agent C ──► Registration + login routes           │
│  Agent D ──► Password reset flow                   │
│  Agent E ──► Profile CRUD routes                   │
│  Agent F ──► Role-based access middleware          │
│                                                    │
│  All 6 work simultaneously                         │
└────────────────────────────────────────────────────┘
```

**Phase 4: Integration (Sequential)**
```
┌────────────────────────────────────────────────────┐
│  Integration agent wires everything together       │
│  Test agent verifies the flows work               │
└────────────────────────────────────────────────────┘
```

### What You See

```
Building user management system...

Exploring your codebase to understand existing patterns...

─── ◈ Orchestrating ── User Management ──

Found: Express 4.x with Mongoose, no existing auth.

Plan:
1. Create User model with roles
2. Implement JWT authentication
3. Build registration with email verification
4. Add password reset flow
5. Create profile management routes
6. Add role-based middleware

Starting parallel implementation...

[Team view shows 6 workers]

─── ◈ Orchestrating ── 6 agents working ──

[Progress updates as each completes]

    ╭──────────────────────────────────────╮
    │  ✨ User Management Complete         │
    │                                      │
    │  Created:                            │
    │  • models/User.js                    │
    │  • middleware/auth.js                │
    │  • middleware/roles.js               │
    │  • routes/auth.js                    │
    │  • routes/users.js                   │
    │  • services/email.js                 │
    │  • utils/tokens.js                   │
    │                                      │
    ╰──────────────────────────────────────╯

All routes are documented in routes/auth.js header.
Run `npm test` to verify.

─── ◈ Complete ──────────────────────────
```

---

## Use Case 2: Debugging a Complex Bug

### Scenario

Users report they can't log in after resetting their password. The bug is intermittent and hard to reproduce.

### What You Say

```
Users can't log in after password reset. This is intermittent -
sometimes it works, sometimes it doesn't. Please investigate
from multiple angles and find the root cause.
```

### What Happens Behind the Scenes

**Phase 1: Parallel Investigation**
```
┌────────────────────────────────────────────────────┐
│  Multiple agents investigate simultaneously:        │
│                                                    │
│  Agent A ──► Search error logs for login failures  │
│  Agent B ──► Find password reset implementation    │
│  Agent C ──► Check session/token handling          │
│  Agent D ──► Look for race conditions              │
│  Agent E ──► Check database transaction handling   │
│                                                    │
│  Each investigator works independently            │
└────────────────────────────────────────────────────┘
```

**Phase 2: Hypothesis Formation**
```
┌────────────────────────────────────────────────────┐
│  Orchestrator synthesizes findings:                │
│                                                    │
│  "Agent A found: Intermittent 401 errors"         │
│  "Agent B found: Password hash updates correctly" │
│  "Agent C found: Old session cookie persists"     │
│  "Agent D found: No race conditions"              │
│  "Agent E found: Transactions are clean"          │
│                                                    │
│  HYPOTHESIS: Session cookie isn't cleared on      │
│  password reset, causing auth mismatch            │
└────────────────────────────────────────────────────┘
```

**Phase 3: Fix and Verify**
```
┌────────────────────────────────────────────────────┐
│  Agent implements fix and regression test          │
└────────────────────────────────────────────────────┘
```

### What You See

```
Investigating the login issue after password reset...

─── ◈ Orchestrating ── Bug Investigation ──

Checking multiple angles simultaneously:
- Error logs
- Password reset flow
- Session handling
- Race conditions
- Database transactions

[Team view shows 5 investigation agents]

─── ◈ Orchestrating ── 5 agents investigating ──

Early findings:
- Password hashing works correctly
- Database updates are atomic
- BUT: Old session cookies persist after reset

Found the root cause:

╭──────────────────────────────────────────────╮
│                                              │
│  ROOT CAUSE: Session Cookie Not Cleared      │
│                                              │
│  When a user resets their password:          │
│  1. Password hash updates in database ✓      │
│  2. Session token invalidates in DB ✓        │
│  3. Cookie NOT cleared in browser ✗          │
│                                              │
│  Next login attempt sends old cookie,        │
│  which fails validation intermittently       │
│  (depends on timing of token refresh)        │
│                                              │
╰──────────────────────────────────────────────╯

Implementing fix...

Fixed in:
• services/auth.js line 89 - Clear cookie on password reset
• Added regression test in __tests__/auth.test.js

─── ◈ Complete ──────────────────────────
```

---

## Use Case 3: Comprehensive Code Review

### Scenario

Your team is about to merge a large PR that touches the payment processing system. You want a thorough review before it goes to production.

### What You Say

```
Review PR #234 comprehensively. This touches payment processing
so I need security, performance, and correctness analysis.
Flag anything that could cause production issues.
```

### What Happens Behind the Scenes

**Parallel Multi-Dimensional Review**
```
┌────────────────────────────────────────────────────┐
│  Specialized reviewers work simultaneously:         │
│                                                    │
│  Security Agent ──► SQL injection, XSS, auth      │
│                     bypass, sensitive data        │
│                                                    │
│  Performance Agent ──► Query complexity,          │
│                        N+1 problems, memory       │
│                                                    │
│  Correctness Agent ──► Business logic,            │
│                        edge cases, error handling │
│                                                    │
│  Standards Agent ──► Code style,                  │
│                      patterns, documentation      │
└────────────────────────────────────────────────────┘
```

### What You See

```
Reviewing PR #234 from multiple angles...

─── ◈ Orchestrating ── PR Review ──

[Team view shows 4 review agents]

─── ◈ Orchestrating ── 4 reviewers working ──

## PR #234 Review: Payment Processing Updates

### Summary
Adds Stripe webhook handling and refund processing.
Changes: 847 additions, 123 deletions across 12 files.

### Risk Assessment
┌───────────────────────────────────────────┐
│  Security:  ████████░░  HIGH              │
│  Performance:  ████░░░░░░  MEDIUM         │
│  Breaking:  ██░░░░░░░░  LOW               │
└───────────────────────────────────────────┘

### 🔴 MUST FIX (Blocking)

1. **SQL Injection in refund query** (security)
   File: `services/refunds.js:47`
   ```javascript
   // VULNERABLE
   db.query(`SELECT * FROM refunds WHERE id = ${req.params.id}`)

   // SHOULD BE
   db.query('SELECT * FROM refunds WHERE id = ?', [req.params.id])
   ```

2. **Missing webhook signature verification** (security)
   File: `routes/webhooks.js:12`
   Stripe webhooks MUST verify signature to prevent spoofing.

3. **Race condition in concurrent refunds** (correctness)
   File: `services/refunds.js:78`
   Two simultaneous refund requests could double-refund.

### 🟡 SHOULD FIX (Non-Blocking)

1. **N+1 query in refund history** (performance)
   File: `services/refunds.js:92`
   Loading 100 refunds makes 101 database queries.

2. **Missing error handling for Stripe timeouts** (correctness)
   File: `services/stripe.js:34`

### ✅ LOOKS GOOD

- Clean separation of webhook types
- Good logging throughout
- Tests cover happy paths
- Consistent error response format

### Recommendation

**Do not merge** until the 3 blocking issues are fixed.
Security issues 1 and 2 are critical for production.

─── ◈ Complete ──────────────────────────
```

---

## Use Case 4: Understanding a New Codebase

### Scenario

You just joined a project and need to understand how a large, unfamiliar codebase works.

### What You Say

```
Help me understand this codebase. I'm new here and need to know:
- Overall architecture and key patterns
- Where the main business logic lives
- How data flows from API to database
- Any gotchas or tricky parts I should know about
```

### What Happens Behind the Scenes

**Parallel Exploration**
```
┌────────────────────────────────────────────────────┐
│  Exploration agents map different aspects:          │
│                                                    │
│  Agent A ──► Project structure, entry points       │
│  Agent B ──► Core architectural patterns           │
│  Agent C ──► Data models and relationships         │
│  Agent D ──► API structure and routing             │
│  Agent E ──► Configuration and environment         │
│  Agent F ──► Test structure and coverage           │
└────────────────────────────────────────────────────┘
```

### What You See

```
Exploring the codebase...

─── ◈ Orchestrating ── Codebase Analysis ──

[Team view shows 6 exploration agents]

## Codebase Overview

### Architecture
```
┌─────────────────────────────────────────────────────┐
│                    Next.js App Router               │
├─────────────────────────────────────────────────────┤
│  app/                                               │
│  ├── (auth)/        ← Protected routes              │
│  ├── api/           ← REST endpoints                │
│  └── (public)/      ← Public pages                  │
├─────────────────────────────────────────────────────┤
│  lib/                                               │
│  ├── db/            ← Prisma + PostgreSQL           │
│  ├── auth/          ← NextAuth.js                   │
│  └── utils/         ← Shared utilities              │
├─────────────────────────────────────────────────────┤
│  components/                                        │
│  ├── ui/            ← shadcn/ui primitives          │
│  └── features/      ← Feature-specific components   │
└─────────────────────────────────────────────────────┘
```

### Key Patterns

| Pattern | Where | Notes |
|---------|-------|-------|
| Server Components | `app/**/page.tsx` | Data fetching at component level |
| API Routes | `app/api/**` | RESTful, uses Zod validation |
| Database | `lib/db/prisma.ts` | Singleton Prisma client |
| Auth | `lib/auth/` | NextAuth with GitHub + Email |
| State | `lib/stores/` | Zustand for client state |

### Data Flow

```
User Action
     │
     ▼
React Component (app/)
     │
     ├──► Server Action OR API Route
     │         │
     │         ▼
     │    Service Layer (lib/services/)
     │         │
     │         ▼
     │    Prisma Client (lib/db/)
     │         │
     │         ▼
     │    PostgreSQL
     │
     ▼
UI Update
```

### Business Logic Locations

| Domain | Location | Key Files |
|--------|----------|-----------|
| Users | `lib/services/users.ts` | CRUD, profile |
| Projects | `lib/services/projects.ts` | Core domain |
| Billing | `lib/services/billing.ts` | Stripe integration |
| Notifications | `lib/services/notifications.ts` | Email + in-app |

### ⚠️ Gotchas

1. **Database connection in serverless**
   - Uses connection pooling in `lib/db/prisma.ts`
   - Don't create new PrismaClient instances

2. **Auth middleware**
   - `middleware.ts` protects `/dashboard/*`
   - API routes need manual auth check

3. **Environment variables**
   - Sensitive vars in `.env.local` (not committed)
   - Public vars prefixed with `NEXT_PUBLIC_`

4. **Type generation**
   - Run `npm run db:generate` after schema changes
   - Types in `node_modules/.prisma/client`

### Getting Started Commands

```bash
npm install              # Install dependencies
npm run db:push          # Sync database schema
npm run db:seed          # Seed test data
npm run dev              # Start dev server (http://localhost:3000)
```

Want me to dive deeper into any area?

─── ◈ Complete ──────────────────────────
```

---

## Use Case 5: Database Migration

### Scenario

You need to migrate from MongoDB to PostgreSQL. This is a major undertaking involving schema changes, code updates, and data migration.

### What You Say

```
Migrate this application from MongoDB to PostgreSQL.
I need:
1. Schema conversion (preserve all data relationships)
2. Updated code throughout (queries, models)
3. Data migration scripts
4. Verification that nothing breaks

This is a critical migration - be thorough.
```

### What Happens Behind the Scenes

**Phase 1: Analysis (Parallel)**
```
┌────────────────────────────────────────────────────┐
│  Agent A ──► Document all MongoDB schemas          │
│  Agent B ──► Find all database queries             │
│  Agent C ──► Map data relationships                │
│  Agent D ──► Identify transformation needs         │
│  Agent E ──► Catalog indexes and constraints       │
└────────────────────────────────────────────────────┘
```

**Phase 2: Schema Design (Sequential)**
```
┌────────────────────────────────────────────────────┐
│  Plan Agent ──► Design PostgreSQL schema           │
│                 considering all relationships      │
└────────────────────────────────────────────────────┘
```

**Phase 3: Code Migration (Parallel)**
```
┌────────────────────────────────────────────────────┐
│  Agent A ──► Update User-related queries           │
│  Agent B ──► Update Product-related queries        │
│  Agent C ──► Update Order-related queries          │
│  Agent D ──► Update Report-related queries         │
│  Agent E ──► Update shared utilities               │
└────────────────────────────────────────────────────┘
```

**Phase 4: Data Migration**
```
┌────────────────────────────────────────────────────┐
│  Agent ──► Create migration scripts                │
│  Agent ──► Add data transformation logic           │
└────────────────────────────────────────────────────┘
```

**Phase 5: Verification**
```
┌────────────────────────────────────────────────────┐
│  Test Agent ──► Verify all queries work            │
│  Test Agent ──► Check data integrity               │
└────────────────────────────────────────────────────┘
```

### What You See

```
Starting MongoDB to PostgreSQL migration...

─── ◈ Orchestrating ── Database Migration ──

This is a significant migration. Let me understand your setup first.

Phase 1: Analyzing current MongoDB structure...

[Team view shows 5 analysis agents]

Analysis complete:
- 8 collections found
- 23 relationships mapped
- 156 queries to update
- 3 aggregation pipelines need special handling

Phase 2: Designing PostgreSQL schema...

╭──────────────────────────────────────────────╮
│  Schema Conversion Plan                      │
│                                              │
│  MongoDB Collection → PostgreSQL Table       │
│  ─────────────────────────────────────       │
│  users            → users + user_profiles    │
│  products         → products                 │
│  orders           → orders + order_items     │
│  reviews          → reviews                  │
│  categories       → categories (+ junction)  │
│  inventory        → inventory                │
│  analytics        → analytics (partitioned)  │
│  sessions         → sessions                 │
│                                              │
│  Embedded docs → Normalized tables           │
│  Arrays → Junction tables                    │
│  ObjectIds → UUIDs                           │
│                                              │
╰──────────────────────────────────────────────╯

Phase 3: Updating code...

─── ◈ Orchestrating ── 5 agents updating code ──

[Progress as each module completes]

    ╭──────────────────────────────────────╮
    │  ✨ Code Migration Complete          │
    │                                      │
    │  Updated:                            │
    │  • 42 files modified                 │
    │  • 156 queries converted             │
    │  • 3 aggregations rewritten          │
    │  • 0 breaking changes               │
    │                                      │
    ╰──────────────────────────────────────╯

Phase 4: Creating migration scripts...

Created:
• migrations/001_schema.sql - Create all tables
• migrations/002_indexes.sql - Add indexes
• scripts/migrate-data.js - Transform and load data

Phase 5: Verification...

Running test suite against new schema...

All 127 tests passing ✓

╭──────────────────────────────────────────────╮
│  Migration Ready                             │
│                                              │
│  To execute:                                 │
│  1. npm run db:migrate     (create tables)   │
│  2. node scripts/migrate-data.js (move data) │
│  3. npm test               (verify)          │
│                                              │
│  Estimated data migration time: ~15 min      │
│  (based on collection sizes)                 │
│                                              │
╰──────────────────────────────────────────────╯

─── ◈ Complete ──────────────────────────
```

---

## Use Case 6: Full Test Suite with Fixes

### Scenario

Your test suite has accumulated failures over time. You want to run all tests and fix every failure.

### What You Say

```
Run the full test suite. For any failures, diagnose and fix them.
I want all tests green by the end.
```

### What Happens Behind the Scenes

**Phase 1: Run Tests (Background)**
```
┌────────────────────────────────────────────────────┐
│  Test Runner Agent ──► Execute full test suite     │
│  (runs in background while orchestrator prepares)  │
└────────────────────────────────────────────────────┘
```

**Phase 2: Parallel Fixes**
```
┌────────────────────────────────────────────────────┐
│  For each failure, spawn a fix agent:              │
│                                                    │
│  Agent A ──► Fix auth.test.ts failure             │
│  Agent B ──► Fix api.test.ts failure              │
│  Agent C ──► Fix utils.test.ts failure            │
│  Agent D ──► Fix integration.test.ts failure      │
│                                                    │
│  All work simultaneously                          │
└────────────────────────────────────────────────────┘
```

**Phase 3: Verify (Background)**
```
┌────────────────────────────────────────────────────┐
│  Test Runner Agent ──► Re-run full suite           │
└────────────────────────────────────────────────────┘
```

### What You See

```
Running full test suite...

─── ◈ Orchestrating ── Test Suite ──

Running tests in background...

Test Results (First Run):
┌────────────────────────────────────────┐
│  Total:   156                          │
│  Passed:  149  ████████████████████░   │
│  Failed:  7    ░░░░░░░░░░░░░░░░░░░░    │
└────────────────────────────────────────┘

Failures:
1. auth.test.ts - "should reject expired tokens"
2. auth.test.ts - "should refresh tokens correctly"
3. api.test.ts - "should handle rate limiting"
4. api.test.ts - "should validate input schema"
5. utils.test.ts - "should format dates correctly"
6. utils.test.ts - "should handle timezones"
7. integration.test.ts - "full checkout flow"

Fixing these in parallel...

─── ◈ Orchestrating ── 7 fix agents working ──

[Progress as each fix completes]

Fix Summary:
┌──────────────────────────────────────────────────────┐
│  1. auth.test.ts (tokens)                            │
│     Issue: Mock clock not advancing                  │
│     Fix: Added jest.advanceTimersByTime()           │
│                                                      │
│  2. api.test.ts (rate limit)                         │
│     Issue: Missing rate limit headers in test       │
│     Fix: Added X-RateLimit-* headers to mock        │
│                                                      │
│  3. utils.test.ts (dates)                            │
│     Issue: Hardcoded timezone assumption            │
│     Fix: Use UTC in test comparisons                │
│                                                      │
│  4. integration.test.ts (checkout)                   │
│     Issue: Stripe mock not returning webhook        │
│     Fix: Added webhook simulation to mock           │
└──────────────────────────────────────────────────────┘

Re-running full test suite...

Final Results:
┌────────────────────────────────────────┐
│  Total:   156                          │
│  Passed:  156  █████████████████████   │
│  Failed:  0                            │
└────────────────────────────────────────┘

All tests passing ✓

─── ◈ Complete ──────────────────────────
```

---

## Tips for Best Results

### 1. Be Specific About Scope

| Less Effective | More Effective |
|----------------|----------------|
| "Fix the bug" | "Fix the login bug that happens after password reset" |
| "Add a feature" | "Add dark mode with a toggle in the header" |
| "Review this code" | "Review this payment code for security issues" |

### 2. Provide Context

```
Good: "Add authentication - we're using Express with PostgreSQL"
Good: "Review for security - this handles credit card data"
Good: "Refactor to async/await - this is a Node.js backend"
```

### 3. Let the Orchestrator Plan

Don't micromanage the process. Instead of:

```
"First read file A, then file B, then create a plan, then implement..."
```

Just say:

```
"Build a user management system with registration, login, and profiles"
```

### 4. Trust the Swarm for Complex Tasks

For multi-part work, the swarm is almost always better than sequential execution:

- Building features ➜ Use swarm
- Investigating bugs ➜ Use swarm
- Code reviews ➜ Use swarm
- Large refactors ➜ Use swarm
- Simple questions ➜ Single agent is fine

### 5. Check Results Incrementally

For large projects, ask for milestone summaries:

```
"After each phase completes, give me a summary of what was done"
```

---

## Troubleshooting

### Swarm Doesn't Seem to Activate

**Symptom:** Claude responds directly without spawning workers.

**Possible causes:**
1. Task is simple enough for single agent
2. Swarm mode might not be properly enabled
3. Claude Code version is too old (pre-2.1.16)

**Solutions:**
- Try a more complex task
- Reinstall: `npx @realmikekelly/claude-sneakpeek update claudesp`
- Verify with: `npx @realmikekelly/claude-sneakpeek doctor`
- Check version: Look for `TaskCreate` tool availability in Claude's responses

### Agents Take Too Long

**Symptom:** Workers seem stuck or progress is slow.

**Solutions:**
- Be more specific in your request
- Break large tasks into smaller chunks
- Check if there are actual errors in the output

### Agents Produce Conflicting Results

**Symptom:** Two workers modified the same file differently.

**Solutions:**
- The orchestrator should detect and resolve this
- If it persists, mention: "There seem to be conflicting changes - please resolve"

### Command Not Found

**Symptom:** `claudesp: command not found`

**Solutions:**
- Add to PATH:
  ```bash
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
  ```
- On Windows, restart your terminal

### Authentication Issues

**Symptom:** Claude asks you to log in repeatedly.

**Solutions:**
- For mirror provider: Complete the OAuth flow in the browser that opens
- For API key providers: Verify your key is valid
- Check: `~/.claude-sneakpeek/claudesp/config/settings.json`

---

## Glossary

| Term | Definition |
|------|------------|
| **Agent** | An AI worker that can use tools (read files, write code, run commands) |
| **Orchestrator** | The main Claude you talk to; coordinates workers but doesn't write code itself |
| **Worker** | A spawned agent that does actual implementation work |
| **Swarm** | Multiple agents working together on a complex task |
| **Task** | A unit of work tracked by the orchestrator |
| **TaskCreate** | Creating a new task in the work queue |
| **TaskUpdate** | Marking a task as in progress, complete, or blocked |
| **Fan-Out** | Spawning multiple agents to work in parallel |
| **Pipeline** | Sequential agents where output feeds the next |
| **Map-Reduce** | Parallel processing followed by aggregation |
| **Background Agent** | An agent working asynchronously while others continue |
| **Feature Flag** | A switch that enables/disables features in software |
| **Variant** | An isolated Claude Code installation with specific settings |

---

## Summary

Agent swarm transforms how you work with AI on complex tasks:

1. **Install** claude-sneakpeek to unlock the feature
2. **Describe** what you want naturally
3. **Watch** as multiple specialized agents work in parallel
4. **Receive** comprehensive, well-integrated results

The swarm handles:
- Feature development
- Bug investigation
- Code reviews
- Codebase exploration
- Large migrations
- Test suite management
- And much more...

Start with simple tasks to see how it works, then tackle increasingly complex projects as you get comfortable with the workflow.

---

## Related Resources

### Official Claude Code Documentation

These official resources from Anthropic provide additional context for understanding Claude Code capabilities:

| Resource | Description |
|----------|-------------|
| [Claude Code Official Docs](https://docs.anthropic.com/en/docs/claude-code) | Official documentation hub |
| [Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) | Version history and feature releases |
| [Anthropic Claude Code GitHub](https://github.com/anthropics/claude-code) | Official repository |

### Key Versions to Know

| Version | Release Notes | Swarm Relevance |
|---------|---------------|-----------------|
| **2.1.16** | "Added new task management system, including new capabilities like dependency tracking" | **The swarm feature debut** — introduced TaskCreate, TaskUpdate, TaskList tools |
| **2.1.17+** | Incremental improvements | Bug fixes and stability for task management |

### claude-sneakpeek Documentation

| Document | Description |
|----------|-------------|
| [Swarm vs Native Comparison](SWARM-VS-NATIVE-COMPARISON.md) | How swarm differs from official Claude Code agents |
| [Quick Start Guide](QUICK-START.md) | Get up and running in minutes |
| [User Guide](USER-GUIDE.md) | Complete user documentation |
| [Provider Guide](providers.md) | Configure different AI providers |
| [Troubleshooting](USER-GUIDE.md#troubleshooting) | Solve common issues |

### Understanding the Tools

The swarm feature uses these core tools:

| Tool | Purpose | Who Uses It |
|------|---------|-------------|
| `TaskCreate` | Create new tasks in the work queue | Orchestrator |
| `TaskUpdate` | Mark tasks as in-progress, complete, or blocked | Orchestrator & Workers |
| `TaskList` | View all tasks and their status | Orchestrator |
| `Task` | Spawn a worker agent for a specific task | Orchestrator |
| `Read`, `Write`, `Edit` | File operations | Workers |
| `Bash` | Run shell commands | Workers |
| `Glob`, `Grep` | Search files and code | Workers & Explore agents |

Happy swarming!
