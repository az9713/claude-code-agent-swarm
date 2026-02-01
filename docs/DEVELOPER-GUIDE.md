# Complete Developer Guide

This guide is for developers who want to understand, modify, or contribute to claude-sneakpeek. We assume you have programming experience (C, C++, Java, etc.) but may be new to TypeScript, Node.js, and modern JavaScript development.

---

## Table of Contents

1. [Prerequisites and Setup](#prerequisites-and-setup)
2. [Understanding the Technology Stack](#understanding-the-technology-stack)
3. [Project Structure Deep Dive](#project-structure-deep-dive)
4. [Development Workflow](#development-workflow)
5. [Core Concepts](#core-concepts)
6. [Adding Features](#adding-features)
7. [Testing](#testing)
8. [Debugging](#debugging)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting Development Issues](#troubleshooting-development-issues)

---

## Prerequisites and Setup

### 1. Install Node.js

Node.js is a JavaScript runtime (like the JVM for Java). We need version 18 or higher.

**Check if installed:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher
```

**Install on Windows:**
1. Download from https://nodejs.org (LTS version)
2. Run installer, click "Next" through all steps
3. Restart your terminal

**Install on macOS:**
```bash
brew install node
```

**Install on Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone the Repository

```bash
git clone https://github.com/mikekelly/claude-sneakpeek.git
cd claude-sneakpeek
```

### 3. Install Dependencies

```bash
npm install
```

This downloads all required packages into `node_modules/`. Think of it like `maven install` in Java.

### 4. Verify Setup

```bash
# Run type checker
npm run typecheck

# Run tests
npm test

# Run the CLI in development mode
npm run dev -- --help
```

If all three work, you're ready to develop!

---

## Understanding the Technology Stack

### TypeScript

TypeScript is JavaScript with type annotations. If you know Java or C++, this will feel familiar:

```typescript
// TypeScript (like Java)
function greet(name: string): string {
  return `Hello, ${name}`;
}

// JavaScript (no types)
function greet(name) {
  return `Hello, ${name}`;
}
```

**Key differences from Java/C++:**
- No separate compilation step visible (tsx handles it)
- Types are erased at runtime (unlike Java generics)
- Interfaces are structural, not nominal

**Quick TypeScript reference:**
```typescript
// Basic types
let name: string = "claude";
let count: number = 42;
let active: boolean = true;
let items: string[] = ["a", "b"];

// Objects
interface User {
  name: string;
  age?: number;  // ? means optional
}

// Functions
function add(a: number, b: number): number {
  return a + b;
}

// Arrow functions (lambdas)
const add = (a: number, b: number): number => a + b;

// Async/await (like CompletableFuture in Java)
async function fetchData(): Promise<string> {
  const response = await fetch(url);
  return response.text();
}
```

### ESM Modules

Modern JavaScript uses `import`/`export` instead of `require()`:

```typescript
// ESM (what we use)
import { createVariant } from './core/index.js';
export function myFunction() { }

// CommonJS (old style - don't use)
const { createVariant } = require('./core');
module.exports = { myFunction };
```

### React (for TUI)

The TUI uses React with Ink (a React renderer for terminals). React is a UI library where you describe what the screen should look like:

```tsx
// A simple React component
function Greeting({ name }: { name: string }) {
  return <Text>Hello, {name}!</Text>;
}

// Using it
<Greeting name="Claude" />
```

**Key React concepts:**
- **Components** — Functions that return UI elements
- **Props** — Input arguments to components
- **Hooks** — Functions like `useState`, `useEffect` for state and side effects
- **JSX** — HTML-like syntax that compiles to function calls

### Node.js APIs

Node.js provides modules for file system, paths, processes:

```typescript
import fs from 'node:fs';           // File operations
import path from 'node:path';       // Path manipulation
import { spawn } from 'node:child_process';  // Run commands

// Read a file
const content = fs.readFileSync('/path/to/file', 'utf-8');

// Join paths (works on all OS)
const fullPath = path.join(homeDir, '.claude-sneakpeek', 'variant');

// Run a command
const child = spawn('npm', ['install'], { cwd: '/some/dir' });
```

---

## Project Structure Deep Dive

```
claude-sneakpeek/
├── src/                          # Source code
│   ├── cli/                      # Command-line interface
│   │   ├── index.ts              # Main entry point
│   │   ├── args.ts               # Argument parsing
│   │   └── commands/             # One file per command
│   │       ├── create.ts
│   │       ├── update.ts
│   │       ├── remove.ts
│   │       ├── list.ts
│   │       ├── doctorCmd.ts
│   │       ├── tweak.ts
│   │       └── tasks.ts
│   │
│   ├── tui/                      # Terminal UI (Ink/React)
│   │   ├── app.tsx               # Main application component
│   │   ├── screens/              # Individual screen components
│   │   ├── components/           # Reusable UI components
│   │   │   └── ui/               # Basic UI primitives
│   │   ├── hooks/                # React hooks (business logic)
│   │   ├── state/                # State types
│   │   ├── router/               # Screen navigation
│   │   └── content/              # Static content (provider info)
│   │
│   ├── core/                     # Core business logic
│   │   ├── index.ts              # Public API exports
│   │   ├── variant-builder/      # Step-based build system
│   │   │   ├── VariantBuilder.ts
│   │   │   ├── VariantUpdater.ts
│   │   │   ├── steps/            # Create steps
│   │   │   └── update-steps/     # Update steps
│   │   ├── prompt-pack/          # System prompt overlays
│   │   │   ├── providers/        # Per-provider overlays
│   │   │   ├── overlays.ts
│   │   │   └── targets.ts
│   │   ├── paths.ts              # Path resolution
│   │   ├── fs.ts                 # File system helpers
│   │   ├── wrapper.ts            # Wrapper script generation
│   │   ├── tweakcc.ts            # TweakCC integration
│   │   └── constants.ts          # Shared constants
│   │
│   ├── providers/                # Provider definitions
│   │   └── index.ts              # All provider templates
│   │
│   ├── brands/                   # Theme presets
│   │   ├── index.ts              # Brand resolution
│   │   ├── types.ts              # Type definitions
│   │   ├── zai.ts                # Z.ai brand
│   │   ├── minimax.ts            # MiniMax brand
│   │   └── ...
│   │
│   └── team-pack/                # Legacy team mode (deprecated)
│
├── test/                         # Tests
│   ├── e2e/                      # End-to-end tests
│   ├── tui/                      # TUI component tests
│   ├── cli/                      # CLI tests
│   ├── core/                     # Core logic tests
│   ├── unit/                     # Unit tests
│   └── helpers/                  # Test utilities
│
├── docs/                         # Documentation
├── repos/                        # Upstream references (vendor data)
├── notes/                        # Research and design notes
├── scripts/                      # Build and utility scripts
└── dist/                         # Build output (generated)
```

### Entry Points

**CLI Entry (`src/cli/index.ts`):**
```
User runs: npx claude-sneakpeek create --provider zai --name test
                    ↓
            src/cli/index.ts
                    ↓
            parseArgs() → { command: 'create', provider: 'zai', name: 'test' }
                    ↓
            commands/create.ts → handleCreate()
                    ↓
            core/index.ts → createVariant()
```

**TUI Entry (`src/tui/app.tsx`):**
```
User runs: npx claude-sneakpeek --tui
                    ↓
            src/cli/index.ts
                    ↓
            Detects --tui flag or TTY interactive mode
                    ↓
            Renders <App /> with Ink
                    ↓
            Router navigates through screens
```

---

## Development Workflow

### Running in Development Mode

```bash
# Run CLI commands through TypeScript directly
npm run dev -- create --provider mirror --name test

# Run TUI
npm run tui

# The -- separates npm arguments from your arguments
npm run dev -- --help
npm run dev -- update test-variant
```

### Making Changes

1. **Edit source files** in `src/`
2. **TypeScript compiles on-the-fly** via `tsx`
3. **Test your changes**:
   ```bash
   npm run dev -- your-command
   ```
4. **Run type checker** to catch errors:
   ```bash
   npm run typecheck
   ```
5. **Run tests** to ensure nothing broke:
   ```bash
   npm test
   ```

### Building for Distribution

```bash
npm run bundle
```

This creates `dist/claude-sneakpeek.mjs` — a single-file bundle that's published to npm.

### Code Quality

```bash
# Check types
npm run typecheck

# Lint (find code style issues)
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changing
npm run format:check

# Run everything
npm run check
```

---

## Core Concepts

### The Variant Builder Pattern

Variants are created through a sequence of **steps**. Each step is a class that performs one specific task:

```typescript
// src/core/variant-builder/steps/PrepareDirectoriesStep.ts
import { BuildStep, BuildContext } from '../types.js';

export class PrepareDirectoriesStep implements BuildStep {
  name = 'Preparing directories';

  execute(ctx: BuildContext): void {
    const { paths } = ctx;

    // Create variant directory structure
    fs.mkdirSync(paths.variantDir, { recursive: true });
    fs.mkdirSync(paths.configDir, { recursive: true });
    fs.mkdirSync(paths.npmDir, { recursive: true });
    fs.mkdirSync(paths.tweakDir, { recursive: true });

    ctx.report(`Created ${paths.variantDir}`);
  }
}
```

**Build Context (`BuildContext`):**
```typescript
interface BuildContext {
  params: CreateVariantParams;    // User's input
  provider: ProviderTemplate;      // Selected provider
  paths: BuildPaths;               // Resolved paths
  state: BuildState;               // Mutable state for passing data
  prefs: BuildPreferences;         // Resolved preferences
  report: (msg: string) => void;   // Progress callback
}
```

**Step execution order** (in `VariantBuilder.ts`):
1. PrepareDirectories — Create folder structure
2. InstallNpm — Download Claude Code
3. WriteConfig — Create settings.json
4. BrandTheme — Set up theme
5. Tweakcc — Apply theme patches
6. Wrapper — Create shell script
7. ShellEnv — Update PATH
8. SkillInstall — Install skills
9. Finalize — Create variant.json

### Provider Templates

Providers define how to connect to different AI backends:

```typescript
// src/providers/index.ts
export interface ProviderTemplate {
  key: string;           // Unique identifier
  label: string;         // Display name
  description: string;   // Shown in TUI
  baseUrl: string;       // API endpoint
  env: ProviderEnv;      // Environment variables to set
  apiKeyLabel: string;   // Prompt for API key
  authMode?: 'apiKey' | 'authToken' | 'none';
  requiresModelMapping?: boolean;
  credentialOptional?: boolean;
  noPromptPack?: boolean;
}

// Example provider
export const ZAI_PROVIDER: ProviderTemplate = {
  key: 'zai',
  label: 'Z.ai',
  description: 'Use GLM models through Z.ai',
  baseUrl: 'https://api.z.ai/api/anthropic',
  apiKeyLabel: 'Z.ai API Key',
  authMode: 'apiKey',
  env: {
    ANTHROPIC_BASE_URL: 'https://api.z.ai/api/anthropic',
    ANTHROPIC_DEFAULT_SONNET_MODEL: 'glm-4.7',
    ANTHROPIC_DEFAULT_HAIKU_MODEL: 'glm-4.5-air',
    // ... more env vars
  }
};
```

### Brand System

Brands customize the visual appearance:

```typescript
// src/brands/zai.ts
export const ZAI_BRAND: BrandConfig = {
  key: 'zai',
  label: 'Z.ai Carbon',
  themeId: 'zai-carbon',
  blockedTools: [
    'WebSearch',  // Z.ai provides its own search
    'WebFetch',
  ]
};
```

### TUI Screen Components

Each screen is a React component:

```tsx
// src/tui/screens/ProviderSelectScreen.tsx
import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useAppState } from '../state/context.js';

interface Props {
  onSelect: (provider: string) => void;
  onBack: () => void;
}

export function ProviderSelectScreen({ onSelect, onBack }: Props) {
  const providers = [
    { label: 'Mirror (Anthropic)', value: 'mirror' },
    { label: 'Z.ai', value: 'zai' },
    // ...
  ];

  return (
    <Box flexDirection="column">
      <Text bold>Select a provider:</Text>
      <SelectInput items={providers} onSelect={item => onSelect(item.value)} />
    </Box>
  );
}
```

### React Hooks for Business Logic

Hooks separate UI from logic:

```typescript
// src/tui/hooks/useVariantCreate.ts
import { useState, useCallback } from 'react';
import { createVariantAsync } from '../../core/index.js';

export function useVariantCreate() {
  const [status, setStatus] = useState<'idle' | 'creating' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (params: CreateVariantParams) => {
    setStatus('creating');
    setProgress([]);

    try {
      const result = await createVariantAsync({
        ...params,
        onProgress: (msg) => setProgress(prev => [...prev, msg])
      });

      setStatus('done');
      return result;
    } catch (err) {
      setError(err.message);
      setStatus('error');
      throw err;
    }
  }, []);

  return { status, progress, error, create };
}
```

---

## Adding Features

### Adding a New CLI Command

1. **Create command file** (`src/cli/commands/mycommand.ts`):

```typescript
import { ParsedArgs } from '../args.js';
import { getDefaultRootDir } from '../../core/paths.js';

export async function handleMyCommand(args: ParsedArgs): Promise<void> {
  const rootDir = args.rootDir || getDefaultRootDir();

  console.log('My command running!');
  console.log('Arguments:', args);

  // Your logic here
}
```

2. **Register in CLI** (`src/cli/index.ts`):

```typescript
import { handleMyCommand } from './commands/mycommand.js';

// In the main function, add to command routing:
case 'mycommand':
  await handleMyCommand(args);
  break;
```

3. **Add to help text** (in `src/cli/index.ts` or args.ts)

### Adding a New Provider

1. **Define the provider** (`src/providers/index.ts`):

```typescript
export const MY_PROVIDER: ProviderTemplate = {
  key: 'myprovider',
  label: 'My Provider',
  description: 'Connect to My Provider API',
  baseUrl: 'https://api.myprovider.com/v1',
  apiKeyLabel: 'My Provider API Key',
  authMode: 'apiKey',
  env: {
    ANTHROPIC_BASE_URL: 'https://api.myprovider.com/v1',
    ANTHROPIC_DEFAULT_SONNET_MODEL: 'my-model',
    DISABLE_AUTOUPDATER: '1',
  }
};

// Add to PROVIDERS array
export const PROVIDERS: ProviderTemplate[] = [
  MIRROR_PROVIDER,
  ZAI_PROVIDER,
  MY_PROVIDER,  // Add here
  // ...
];
```

2. **Add brand (optional)** (`src/brands/myprovider.ts`):

```typescript
export const MY_BRAND: BrandConfig = {
  key: 'myprovider',
  label: 'My Provider Theme',
  themeId: 'my-theme',
  blockedTools: []
};
```

3. **Add prompt pack (optional)** (`src/core/prompt-pack/providers/myprovider.ts`):

```typescript
export const MY_PROVIDER_OVERLAY = `
You are connected through My Provider.
Use the my-provider-tool command for...
`;
```

4. **Register in brand index** (`src/brands/index.ts`)

### Adding a New TUI Screen

1. **Create screen component** (`src/tui/screens/MyScreen.tsx`):

```tsx
import React from 'react';
import { Box, Text } from 'ink';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function MyScreen({ onNext, onBack }: Props) {
  return (
    <Box flexDirection="column">
      <Text bold>My Screen</Text>
      <Text>Press Enter to continue</Text>
    </Box>
  );
}
```

2. **Add to router** (`src/tui/router/routes.ts`):

```typescript
export type Screen =
  | 'home'
  | 'my-screen'  // Add here
  | 'provider-select'
  // ...
```

3. **Wire up in app** (`src/tui/app.tsx`):

```tsx
import { MyScreen } from './screens/MyScreen.js';

// In render:
{screen === 'my-screen' && (
  <MyScreen
    onNext={() => setScreen('next-screen')}
    onBack={() => setScreen('home')}
  />
)}
```

### Adding a New Build Step

1. **Create step class** (`src/core/variant-builder/steps/MyStep.ts`):

```typescript
import { BuildStep, BuildContext } from '../types.js';

export class MyStep implements BuildStep {
  name = 'Performing my step';

  execute(ctx: BuildContext): void {
    // Synchronous implementation
    ctx.report('Starting my step...');

    // Access context
    const { paths, params, provider, state } = ctx;

    // Do something
    // ...

    ctx.report('My step complete!');
  }

  // OR async version
  async executeAsync(ctx: BuildContext): Promise<void> {
    ctx.report('Starting async step...');
    await someAsyncOperation();
    ctx.report('Done!');
  }
}
```

2. **Register in builder** (`src/core/variant-builder/VariantBuilder.ts`):

```typescript
import { MyStep } from './steps/MyStep.js';

// Add to steps array in correct order
const steps: BuildStep[] = [
  new PrepareDirectoriesStep(),
  new InstallNpmStep(),
  new MyStep(),  // Add here (order matters!)
  new WriteConfigStep(),
  // ...
];
```

---

## Testing

### Test Framework

We use Node.js's built-in test runner (no Jest needed):

```typescript
// test/unit/example.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('MyFeature', () => {
  it('should do something', () => {
    const result = myFunction(1, 2);
    assert.strictEqual(result, 3);
  });

  it('should handle errors', async () => {
    await assert.rejects(
      async () => await failingFunction(),
      /Expected error message/
    );
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/unit/example.test.ts

# Run tests matching a pattern
npm test -- --test-name-pattern="MyFeature"

# Run E2E tests only
npm test -- --test-name-pattern="E2E"

# Run TUI tests only
npm test -- --test-name-pattern="TUI"

# Watch mode (re-run on changes)
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Organization

| Directory | Purpose | Example |
|-----------|---------|---------|
| `test/e2e/` | Full workflow tests | Creating variants, running commands |
| `test/tui/` | TUI component tests | Screen rendering, user interaction |
| `test/cli/` | CLI parsing and output | Argument parsing, help text |
| `test/core/` | Core logic tests | Path resolution, file operations |
| `test/unit/` | Isolated unit tests | Individual functions |

### Writing E2E Tests

```typescript
// test/e2e/creation.test.ts
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createVariant } from '../../src/core/index.js';

describe('E2E: Variant Creation', () => {
  const testRoot = '/tmp/test-claude-sneakpeek';

  before(() => {
    // Clean up before tests
    fs.rmSync(testRoot, { recursive: true, force: true });
  });

  after(() => {
    // Clean up after tests
    fs.rmSync(testRoot, { recursive: true, force: true });
  });

  it('should create a mirror variant', () => {
    const result = createVariant({
      rootDir: testRoot,
      name: 'test-mirror',
      provider: 'mirror'
    });

    assert.ok(result.success);
    assert.ok(fs.existsSync(path.join(testRoot, 'test-mirror', 'variant.json')));
  });
});
```

### Writing TUI Tests

```typescript
// test/tui/HomeScreen.test.tsx
import { describe, it } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render } from 'ink-testing-library';
import { HomeScreen } from '../../src/tui/screens/HomeScreen.js';

describe('TUI: HomeScreen', () => {
  it('should render menu options', () => {
    const { lastFrame } = render(
      <HomeScreen onSelect={() => {}} />
    );

    assert.ok(lastFrame()?.includes('Quick Setup'));
    assert.ok(lastFrame()?.includes('New Variant'));
    assert.ok(lastFrame()?.includes('Manage Variants'));
  });
});
```

---

## Debugging

### Debug CLI Commands

```bash
# Add DEBUG environment variable
DEBUG=* npm run dev -- create --provider mirror --name test

# Or use Node's inspector
node --inspect --import tsx src/cli/index.ts create --provider mirror --name test
```

### Debug with VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug CLI",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "src/cli/index.ts"],
      "args": ["create", "--provider", "mirror", "--name", "test"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

### Inspect Generated Files

```bash
# View variant config
cat ~/.claude-sneakpeek/VARIANT_NAME/config/settings.json

# View variant metadata
cat ~/.claude-sneakpeek/VARIANT_NAME/variant.json

# View wrapper script
cat ~/.local/bin/VARIANT_NAME

# View theme config
cat ~/.claude-sneakpeek/VARIANT_NAME/tweakcc/config.json
```

### Common Debug Techniques

**Add logging:**
```typescript
console.log('DEBUG:', variable);
console.log('DEBUG ctx:', JSON.stringify(ctx, null, 2));
```

**Test a single step:**
```typescript
// In a test file
const step = new MyStep();
step.execute(mockContext);
```

**Inspect npm install:**
```bash
# See what's installed
ls ~/.claude-sneakpeek/VARIANT_NAME/npm/node_modules/@anthropic-ai/claude-code/
```

---

## Common Patterns

### Error Handling

```typescript
// Use try-catch for recoverable errors
try {
  await riskyOperation();
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error('File not found');
  } else {
    throw err;  // Re-throw unexpected errors
  }
}

// For functions that can fail, return result objects
interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function safeOperation(): Result<string> {
  try {
    return { success: true, data: doSomething() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
```

### Path Handling

Always use `path.join()` for cross-platform compatibility:

```typescript
import path from 'node:path';
import os from 'node:os';

// Good
const configPath = path.join(os.homedir(), '.claude-sneakpeek', 'variant', 'config');

// Bad (won't work on Windows)
const configPath = `${os.homedir()}/.claude-sneakpeek/variant/config`;
```

### File Operations

```typescript
import fs from 'node:fs';

// Reading JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Writing JSON (pretty printed)
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Create directory (recursive)
fs.mkdirSync(dirPath, { recursive: true });

// Check if exists
if (fs.existsSync(filePath)) { ... }

// Copy file
fs.copyFileSync(source, dest);

// Delete (recursive)
fs.rmSync(dirPath, { recursive: true, force: true });
```

### Async/Await Patterns

```typescript
// Sequential operations
const result1 = await operation1();
const result2 = await operation2(result1);

// Parallel operations
const [result1, result2] = await Promise.all([
  operation1(),
  operation2()
]);

// Error handling
try {
  await riskyAsyncOperation();
} catch (err) {
  console.error('Failed:', err.message);
}
```

---

## Troubleshooting Development Issues

### "Cannot find module" Error

**Cause:** Missing `.js` extension in import.

**Fix:** Always include `.js` extension:
```typescript
// Good
import { myFunction } from './utils.js';

// Bad
import { myFunction } from './utils';
```

### TypeScript Errors

**Run type checker:**
```bash
npm run typecheck
```

**Common fixes:**
```typescript
// Type assertion
const value = unknownValue as string;

// Null check
if (maybeNull !== null) {
  maybeNull.property  // Now safe
}

// Optional chaining
const value = obj?.property?.nested;
```

### Tests Failing

```bash
# Run single test to isolate
npm test -- --test-name-pattern="failing test name"

# Check if it's a timing issue (async)
# Add longer timeout in test
it('slow test', { timeout: 10000 }, async () => {
  // ...
});
```

### Changes Not Taking Effect

**Make sure you're running dev mode:**
```bash
npm run dev -- your-command
```

**Not the bundled version:**
```bash
# This runs the BUNDLED code, not your changes
npx @realmikekelly/claude-sneakpeek your-command
```

### Permission Errors

**On macOS/Linux:**
```bash
# Make wrapper executable
chmod +x ~/.local/bin/variant-name

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Debugging Ink/React TUI

```typescript
// Log to stderr (won't mess up terminal)
console.error('Debug:', value);

// Or use the debug package
import createDebug from 'debug';
const debug = createDebug('tui:screen');
debug('Rendering with props:', props);
```

---

## Next Steps

1. **Read the Architecture Deep Dive** (`docs/ARCHITECTURE-DEEP-DIVE.md`) for detailed system design
2. **Browse the code** starting from `src/cli/index.ts`
3. **Run the tests** to understand expected behavior
4. **Create a test variant** to see the full flow
5. **Make a small change** (like updating help text) to practice the workflow

Welcome to the team!
