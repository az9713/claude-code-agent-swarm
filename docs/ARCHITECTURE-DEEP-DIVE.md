# Architecture Deep Dive

This document provides a comprehensive technical reference for the claude-sneakpeek architecture. It covers system design, data flows, component interactions, and implementation details.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Directory Structure](#directory-structure)
3. [Data Flow](#data-flow)
4. [Component Architecture](#component-architecture)
5. [The Build Pipeline](#the-build-pipeline)
6. [Provider System](#provider-system)
7. [Brand and Theme System](#brand-and-theme-system)
8. [Prompt Pack System](#prompt-pack-system)
9. [TUI Architecture](#tui-architecture)
10. [Configuration Management](#configuration-management)
11. [Wrapper Script Generation](#wrapper-script-generation)
12. [Testing Architecture](#testing-architecture)
13. [Extension Points](#extension-points)
14. [Security Considerations](#security-considerations)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface Layer                         │
├─────────────────────────────────┬───────────────────────────────────┤
│            CLI                  │              TUI                   │
│     (src/cli/index.ts)          │        (src/tui/app.tsx)           │
│                                 │                                    │
│  ┌──────────────────────┐       │  ┌────────────────────────────┐   │
│  │ Command Handlers     │       │  │ Screen Components          │   │
│  │ - create.ts          │       │  │ - HomeScreen               │   │
│  │ - update.ts          │       │  │ - ProviderSelectScreen     │   │
│  │ - remove.ts          │       │  │ - ProgressScreen           │   │
│  │ - list.ts            │       │  │ - etc.                     │   │
│  │ - doctor.ts          │       │  └────────────────────────────┘   │
│  └──────────────────────┘       │                                    │
└─────────────────────────────────┴───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Core Layer                                  │
│                      (src/core/index.ts)                            │
├─────────────────────────────────────────────────────────────────────┤
│  Public API:                                                         │
│  - createVariant() / createVariantAsync()                           │
│  - updateVariant() / updateVariantAsync()                           │
│  - removeVariant()                                                   │
│  - listVariants()                                                    │
│  - doctor()                                                          │
│  - tweakVariant()                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Build System Layer                             │
│               (src/core/variant-builder/)                            │
├─────────────────────────────────────────────────────────────────────┤
│  VariantBuilder.ts          │  VariantUpdater.ts                     │
│  ├── PrepareDirectories     │  ├── RebuildUpdateStep                │
│  ├── InstallNpm             │  ├── ConfigUpdateStep                 │
│  ├── WriteConfig            │  ├── ModelOverridesStep               │
│  ├── BrandTheme             │  ├── TweakccUpdateStep                │
│  ├── Tweakcc                │  ├── WrapperUpdateStep                │
│  ├── Wrapper                │  └── FinalizeUpdateStep               │
│  ├── ShellEnv               │                                        │
│  ├── SkillInstall           │                                        │
│  └── Finalize               │                                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Support Layers                                │
├──────────────────┬──────────────────┬───────────────────────────────┤
│    Providers     │     Brands       │        Prompt Packs           │
│ (src/providers/) │  (src/brands/)   │  (src/core/prompt-pack/)      │
├──────────────────┼──────────────────┼───────────────────────────────┤
│ - mirror         │ - zai            │ - zai overlay                 │
│ - zai            │ - minimax        │ - minimax overlay             │
│ - minimax        │ - openrouter     │ - default overlay             │
│ - openrouter     │ - ccrouter       │                               │
│ - ccrouter       │ - mirror         │                               │
│ - custom         │                  │                               │
└──────────────────┴──────────────────┴───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        External Dependencies                         │
├─────────────────────────────────────────────────────────────────────┤
│  @anthropic-ai/claude-code    │  tweakcc (npm package)              │
│  (Downloaded to npm/)          │  (Theme patching)                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Isolation**: Each variant is completely independent
2. **Non-destructive**: Never modifies global installations
3. **Extensible**: Easy to add new providers, brands, steps
4. **Testable**: Components have clear interfaces
5. **Cross-platform**: Works on Windows, macOS, Linux

---

## Directory Structure

### Source Code Layout

```
src/
├── cli/                          # Command-line interface
│   ├── index.ts                  # Entry point, command routing
│   ├── args.ts                   # Argument parsing utilities
│   └── commands/                 # Command implementations
│       ├── create.ts             # create command
│       ├── update.ts             # update command
│       ├── remove.ts             # remove command
│       ├── list.ts               # list command
│       ├── doctorCmd.ts          # doctor command
│       ├── tweak.ts              # tweak command
│       └── tasks.ts              # tasks command (legacy)
│
├── tui/                          # Terminal UI (Ink/React)
│   ├── app.tsx                   # Root application component
│   ├── screens/                  # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ProviderSelectScreen.tsx
│   │   ├── ProviderIntroScreen.tsx
│   │   ├── ApiKeyScreen.tsx
│   │   ├── ModelConfigScreen.tsx
│   │   ├── RouterUrlScreen.tsx
│   │   ├── EnvEditorScreen.tsx
│   │   ├── TeamModeScreen.tsx
│   │   ├── SummaryScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   ├── CompletionScreen.tsx
│   │   ├── VariantListScreen.tsx
│   │   ├── VariantActionsScreen.tsx
│   │   ├── DiagnosticsScreen.tsx
│   │   ├── AboutScreen.tsx
│   │   └── FeedbackScreen.tsx
│   ├── components/               # Reusable components
│   │   └── ui/                   # UI primitives
│   │       ├── Layout.tsx
│   │       ├── Typography.tsx
│   │       ├── theme.js
│   │       ├── Menu.tsx
│   │       ├── AsciiArt.tsx
│   │       ├── YesNoSelect.tsx
│   │       ├── TextField.tsx
│   │       └── Input.tsx
│   ├── hooks/                    # React hooks
│   │   ├── useVariantCreate.ts
│   │   ├── useVariantUpdate.ts
│   │   ├── useUpdateAll.ts
│   │   ├── useModelConfig.ts
│   │   └── useTeamModeToggle.ts
│   ├── state/                    # State management
│   │   ├── types.ts
│   │   └── context.ts
│   ├── router/                   # Navigation
│   │   └── routes.ts
│   └── content/                  # Static content
│       └── providers.js
│
├── core/                         # Core business logic
│   ├── index.ts                  # Public API
│   ├── constants.ts              # Shared constants
│   ├── paths.ts                  # Path resolution
│   ├── fs.ts                     # File system utilities
│   ├── wrapper.ts                # Wrapper script generation
│   ├── tweakcc.ts                # TweakCC integration
│   ├── skills.ts                 # Skill installation
│   ├── variant-builder/          # Build system
│   │   ├── VariantBuilder.ts     # Create orchestrator
│   │   ├── VariantUpdater.ts     # Update orchestrator
│   │   ├── types.ts              # Type definitions
│   │   ├── steps/                # Create steps
│   │   │   ├── PrepareDirectoriesStep.ts
│   │   │   ├── InstallNpmStep.ts
│   │   │   ├── WriteConfigStep.ts
│   │   │   ├── BrandThemeStep.ts
│   │   │   ├── TweakccStep.ts
│   │   │   ├── WrapperStep.ts
│   │   │   ├── ShellEnvStep.ts
│   │   │   ├── SkillInstallStep.ts
│   │   │   └── FinalizeStep.ts
│   │   └── update-steps/         # Update steps
│   │       ├── RebuildUpdateStep.ts
│   │       ├── ConfigUpdateStep.ts
│   │       └── ...
│   └── prompt-pack/              # System prompt overlays
│       ├── providers/            # Per-provider overlays
│       │   ├── zai.ts
│       │   ├── minimax.ts
│       │   └── default.ts
│       ├── overlays.ts           # Overlay resolution
│       └── targets.ts            # Target file mapping
│
├── providers/                    # Provider definitions
│   └── index.ts                  # All provider templates
│
├── brands/                       # Theme presets
│   ├── index.ts                  # Brand resolution
│   ├── types.ts                  # Type definitions
│   ├── zai.ts                    # Z.ai brand
│   ├── minimax.ts                # MiniMax brand
│   ├── openrouter.ts
│   ├── ccrouter.ts
│   └── mirror.ts
│
└── team-pack/                    # Legacy team mode
    ├── index.ts
    └── *.md                      # Prompt files
```

### Runtime Directory Layout

```
~/.claude-sneakpeek/
├── variant-name/
│   ├── config/                   # CLAUDE_CONFIG_DIR
│   │   ├── settings.json         # Environment variables
│   │   ├── .claude.json          # Claude Code settings
│   │   ├── skills/               # Installed skills
│   │   └── tasks/                # Legacy team tasks
│   │       └── team-name/
│   │           └── *.json
│   │
│   ├── tweakcc/                  # Theme configuration
│   │   ├── config.json           # TweakCC config
│   │   ├── system-prompts/       # Prompt overlays
│   │   │   ├── main.md
│   │   │   └── *.md
│   │   └── backups/              # Pre-patch backups
│   │
│   ├── npm/                      # Claude Code installation
│   │   ├── package.json
│   │   └── node_modules/
│   │       └── @anthropic-ai/
│   │           └── claude-code/
│   │               ├── cli.js    # Main executable
│   │               └── ...
│   │
│   └── variant.json              # Variant metadata
│
├── another-variant/
│   └── ...
│
└── bin/                          # Windows wrapper scripts
    └── variant-name.cmd

~/.local/bin/                     # macOS/Linux wrapper scripts
└── variant-name
```

---

## Data Flow

### Variant Creation Flow

```
User Input                 CLI/TUI                    Core                      File System
    │                         │                         │                            │
    │  create --provider zai  │                         │                            │
    │────────────────────────>│                         │                            │
    │                         │                         │                            │
    │                         │  parseArgs()            │                            │
    │                         │────────────>            │                            │
    │                         │                         │                            │
    │                         │  createVariant(params)  │                            │
    │                         │────────────────────────>│                            │
    │                         │                         │                            │
    │                         │                         │  1. PrepareDirectories     │
    │                         │                         │────────────────────────────>│
    │                         │                         │        mkdir -p            │
    │                         │                         │                            │
    │                         │                         │  2. InstallNpm             │
    │                         │                         │────────────────────────────>│
    │                         │                         │        npm install         │
    │                         │                         │                            │
    │                         │                         │  3. WriteConfig            │
    │                         │                         │────────────────────────────>│
    │                         │                         │    write settings.json     │
    │                         │                         │                            │
    │                         │                         │  4. BrandTheme             │
    │                         │                         │────────────────────────────>│
    │                         │                         │   write tweakcc/config     │
    │                         │                         │                            │
    │                         │                         │  5. Tweakcc                │
    │                         │                         │────────────────────────────>│
    │                         │                         │     patch cli.js           │
    │                         │                         │                            │
    │                         │                         │  6. Wrapper                │
    │                         │                         │────────────────────────────>│
    │                         │                         │  write ~/.local/bin/name   │
    │                         │                         │                            │
    │                         │                         │  7. ShellEnv               │
    │                         │                         │────────────────────────────>│
    │                         │                         │     update ~/.zshrc        │
    │                         │                         │                            │
    │                         │                         │  8. SkillInstall           │
    │                         │                         │────────────────────────────>│
    │                         │                         │     copy skill files       │
    │                         │                         │                            │
    │                         │                         │  9. Finalize               │
    │                         │                         │────────────────────────────>│
    │                         │                         │    write variant.json      │
    │                         │                         │                            │
    │                         │<────────────────────────│                            │
    │                         │     { success: true }   │                            │
    │<────────────────────────│                         │                            │
    │     "Done!"             │                         │                            │
```

### Variant Execution Flow

```
User                      Wrapper Script                Claude Code                AI Provider
  │                            │                            │                          │
  │  $ claudesp               │                            │                          │
  │───────────────────────────>│                            │                          │
  │                            │                            │                          │
  │                            │  export CLAUDE_CONFIG_DIR  │                          │
  │                            │  load settings.json → env  │                          │
  │                            │                            │                          │
  │                            │  node cli.js               │                          │
  │                            │───────────────────────────>│                          │
  │                            │                            │                          │
  │                            │                            │  Read $ANTHROPIC_BASE_URL
  │                            │                            │  Read $ANTHROPIC_API_KEY │
  │                            │                            │                          │
  │                            │                            │  API Request             │
  │                            │                            │─────────────────────────>│
  │                            │                            │                          │
  │                            │                            │<─────────────────────────│
  │                            │                            │       Response           │
  │                            │                            │                          │
  │<───────────────────────────│<───────────────────────────│                          │
  │        Output              │                            │                          │
```

---

## Component Architecture

### CLI Module (`src/cli/`)

```typescript
// Entry Point: src/cli/index.ts
async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Route to appropriate handler
  switch (args._[0]) {
    case 'create':
      await handleCreate(args);
      break;
    case 'update':
      await handleUpdate(args);
      break;
    // ... other commands
  }
}

// Argument Parsing: src/cli/args.ts
interface ParsedArgs {
  _: string[];                    // Positional arguments
  provider?: string;              // --provider
  name?: string;                  // --name
  apiKey?: string;                // --api-key
  baseUrl?: string;               // --base-url
  modelSonnet?: string;           // --model-sonnet
  modelOpus?: string;             // --model-opus
  modelHaiku?: string;            // --model-haiku
  brand?: string;                 // --brand
  noTweak?: boolean;              // --no-tweak
  noPromptPack?: boolean;         // --no-prompt-pack
  noSkillInstall?: boolean;       // --no-skill-install
  shellEnv?: boolean;             // --shell-env / --no-shell-env
  env?: string[];                 // --env KEY=VALUE
  yes?: boolean;                  // --yes (non-interactive)
  tui?: boolean;                  // --tui
  quick?: boolean;                // --quick
  // ... more flags
}
```

### Core Module (`src/core/`)

```typescript
// Public API: src/core/index.ts
export interface CreateVariantParams {
  rootDir?: string;
  binDir?: string;
  name: string;
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  env?: Record<string, string>;
  modelMapping?: ModelMapping;
  brand?: string;
  noTweak?: boolean;
  noPromptPack?: boolean;
  noSkillInstall?: boolean;
  shellEnv?: boolean;
  onProgress?: (message: string) => void;
}

export interface CreateVariantResult {
  success: boolean;
  variantDir?: string;
  wrapperPath?: string;
  error?: string;
  notes?: string[];
}

export function createVariant(params: CreateVariantParams): CreateVariantResult;
export function createVariantAsync(params: CreateVariantParams): Promise<CreateVariantResult>;

export function updateVariant(rootDir: string, name: string, opts?: UpdateOptions): UpdateResult;
export function updateVariantAsync(rootDir: string, name: string, opts?: UpdateOptions): Promise<UpdateResult>;

export function removeVariant(rootDir: string, name: string, binDir?: string): RemoveResult;
export function listVariants(rootDir: string): VariantInfo[];
export function doctor(rootDir: string, binDir?: string): DoctorResult;
```

### Build Context

```typescript
// src/core/variant-builder/types.ts
interface BuildContext {
  params: CreateVariantParams;    // User's input parameters
  provider: ProviderTemplate;      // Resolved provider
  paths: BuildPaths;               // All resolved paths
  state: BuildState;               // Mutable state during build
  prefs: BuildPreferences;         // Resolved preferences
  report: ReportFn;                // Progress callback
}

interface BuildPaths {
  rootDir: string;                 // ~/.claude-sneakpeek
  variantDir: string;              // ~/.claude-sneakpeek/variant
  configDir: string;               // ~/.claude-sneakpeek/variant/config
  tweakDir: string;                // ~/.claude-sneakpeek/variant/tweakcc
  npmDir: string;                  // ~/.claude-sneakpeek/variant/npm
  binDir: string;                  // ~/.local/bin or ~/.claude-sneakpeek/bin
  wrapperPath: string;             // ~/.local/bin/variant
}

interface BuildState {
  notes: string[];                 // Messages to show user
  env: Record<string, string>;     // Environment being built
  resolvedApiKey?: string;         // Resolved API key
  installedVersion?: string;       // Installed npm version
}

interface BuildPreferences {
  brandKey?: string;               // Resolved brand key
  promptPackPreference?: 'minimal' | 'maximal' | 'none';
  skillInstall?: boolean;
}
```

---

## The Build Pipeline

### Step Interface

```typescript
// src/core/variant-builder/types.ts
interface BuildStep {
  name: string;                              // Display name
  execute?(ctx: BuildContext): void;         // Sync implementation
  executeAsync?(ctx: BuildContext): Promise<void>;  // Async implementation
}
```

### Create Steps (Detailed)

#### 1. PrepareDirectoriesStep

**Purpose:** Create the variant directory structure.

```typescript
execute(ctx: BuildContext): void {
  const { paths, report } = ctx;

  // Create directories
  fs.mkdirSync(paths.variantDir, { recursive: true });
  fs.mkdirSync(paths.configDir, { recursive: true });
  fs.mkdirSync(paths.npmDir, { recursive: true });
  fs.mkdirSync(paths.tweakDir, { recursive: true });

  // Create bin directory if needed
  fs.mkdirSync(paths.binDir, { recursive: true });

  report(`Created ${paths.variantDir}`);
}
```

#### 2. InstallNpmStep

**Purpose:** Download and install Claude Code.

```typescript
async executeAsync(ctx: BuildContext): Promise<void> {
  const { paths, params, report } = ctx;

  const pkg = params.npmPackage || DEFAULT_NPM_PACKAGE;
  const version = DEFAULT_NPM_VERSION;

  report(`Installing ${pkg}@${version}...`);

  // Create minimal package.json
  fs.writeFileSync(
    path.join(paths.npmDir, 'package.json'),
    JSON.stringify({ name: 'claude-sneakpeek-variant', private: true }, null, 2)
  );

  // Run npm install
  await runCommand('npm', ['install', `${pkg}@${version}`], {
    cwd: paths.npmDir
  });

  ctx.state.installedVersion = version;
}
```

#### 3. WriteConfigStep

**Purpose:** Create settings.json with environment variables.

```typescript
execute(ctx: BuildContext): void {
  const { paths, provider, params, state, report } = ctx;

  // Build environment from provider defaults
  const env: Record<string, string> = {
    ...provider.env,
    DISABLE_AUTOUPDATER: '1',
  };

  // Add API key if provided
  if (params.apiKey) {
    if (provider.authMode === 'authToken') {
      env.ANTHROPIC_AUTH_TOKEN = params.apiKey;
    } else {
      env.ANTHROPIC_API_KEY = params.apiKey;
    }
  }

  // Add base URL override
  if (params.baseUrl) {
    env.ANTHROPIC_BASE_URL = params.baseUrl;
  }

  // Add model mappings
  if (params.modelMapping) {
    if (params.modelMapping.sonnet) {
      env.ANTHROPIC_DEFAULT_SONNET_MODEL = params.modelMapping.sonnet;
    }
    // ... opus, haiku
  }

  // Merge extra env
  if (params.env) {
    Object.assign(env, params.env);
  }

  // Write settings.json
  const settings = { env };
  fs.writeFileSync(
    path.join(paths.configDir, 'settings.json'),
    JSON.stringify(settings, null, 2)
  );

  // Store API key approval in .claude.json
  if (params.apiKey) {
    const claudeJson = {
      hasCompletedOnboarding: true,
      customApiKeyResponses: {
        approved: [params.apiKey.slice(-20)]
      }
    };
    fs.writeFileSync(
      path.join(paths.configDir, '.claude.json'),
      JSON.stringify(claudeJson, null, 2)
    );
  }

  state.env = env;
  report('Configuration written');
}
```

#### 4. BrandThemeStep

**Purpose:** Set up TweakCC brand configuration.

```typescript
execute(ctx: BuildContext): void {
  const { paths, params, provider, prefs, report } = ctx;

  // Resolve brand key
  const brandKey = prefs.brandKey || resolveBrandForProvider(provider.key);

  if (!brandKey || brandKey === 'none') {
    report('Skipping brand theme');
    return;
  }

  const brand = getBrandConfig(brandKey);
  if (!brand) {
    report(`Unknown brand: ${brandKey}`);
    return;
  }

  // Write tweakcc config
  const tweakConfig = {
    preset: brand.key,
    themes: [brand.themeId],
    toolsets: brand.blockedTools?.length ? {
      blocked: brand.blockedTools
    } : undefined
  };

  fs.writeFileSync(
    path.join(paths.tweakDir, 'config.json'),
    JSON.stringify(tweakConfig, null, 2)
  );

  // Update .claude.json with theme
  const claudeJsonPath = path.join(paths.configDir, '.claude.json');
  const claudeJson = JSON.parse(fs.readFileSync(claudeJsonPath, 'utf-8'));
  claudeJson.theme = brand.themeId;
  fs.writeFileSync(claudeJsonPath, JSON.stringify(claudeJson, null, 2));

  report(`Applied ${brand.label} theme`);
}
```

#### 5. TweakccStep

**Purpose:** Run TweakCC to patch system prompts.

```typescript
async executeAsync(ctx: BuildContext): Promise<void> {
  const { paths, params, provider, prefs, report } = ctx;

  if (params.noTweak) {
    report('Skipping tweakcc');
    return;
  }

  // Run tweakcc
  await runTweakcc(paths.npmDir, paths.tweakDir);

  // Apply prompt pack if enabled
  if (prefs.promptPackPreference !== 'none' && !provider.noPromptPack) {
    const overlay = getPromptOverlay(provider.key);
    if (overlay) {
      const targetPath = path.join(paths.tweakDir, 'system-prompts', 'main.md');
      const existing = fs.readFileSync(targetPath, 'utf-8');
      fs.writeFileSync(targetPath, existing + '\n\n' + overlay);

      // Re-run tweakcc to apply overlays
      await runTweakcc(paths.npmDir, paths.tweakDir);
    }
  }

  report('Theme applied');
}
```

#### 6. WrapperStep

**Purpose:** Generate the shell wrapper script.

```typescript
execute(ctx: BuildContext): void {
  const { paths, params, state, report } = ctx;

  const cliPath = path.join(
    paths.npmDir,
    'node_modules/@anthropic-ai/claude-code/cli.js'
  );

  if (process.platform === 'win32') {
    // Windows batch script
    const script = generateWindowsWrapper(paths.configDir, cliPath, state.env);
    const wrapperPath = path.join(paths.binDir, `${params.name}.cmd`);
    fs.writeFileSync(wrapperPath, script);
  } else {
    // Unix shell script
    const script = generateUnixWrapper(paths.configDir, cliPath, state.env);
    fs.writeFileSync(paths.wrapperPath, script);
    fs.chmodSync(paths.wrapperPath, 0o755);
  }

  report(`Created wrapper: ${paths.wrapperPath}`);
}
```

#### 7. ShellEnvStep

**Purpose:** Update shell profile with PATH.

```typescript
execute(ctx: BuildContext): void {
  const { paths, params, report } = ctx;

  if (params.shellEnv === false) {
    report('Skipping shell environment update');
    return;
  }

  if (process.platform === 'win32') {
    // Windows: PATH is usually set during install
    return;
  }

  // Detect shell
  const shell = process.env.SHELL || '/bin/bash';
  const rcFile = shell.includes('zsh') ? '.zshrc' : '.bashrc';
  const rcPath = path.join(os.homedir(), rcFile);

  // Add to PATH if not present
  const line = `export PATH="$HOME/.local/bin:$PATH"`;
  const content = fs.existsSync(rcPath)
    ? fs.readFileSync(rcPath, 'utf-8')
    : '';

  if (!content.includes('.local/bin')) {
    fs.appendFileSync(rcPath, `\n# Added by claude-sneakpeek\n${line}\n`);
    report(`Updated ${rcFile}`);
  }
}
```

#### 8. SkillInstallStep

**Purpose:** Install optional skills.

```typescript
execute(ctx: BuildContext): void {
  const { paths, params, provider, prefs, report } = ctx;

  if (prefs.skillInstall === false) {
    report('Skipping skill installation');
    return;
  }

  // Install provider-specific skills
  const skillsDir = path.join(paths.configDir, 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });

  // Copy skill files
  const skillSource = getSkillsForProvider(provider.key);
  if (skillSource) {
    copySkills(skillSource, skillsDir);
    report('Skills installed');
  }
}
```

#### 9. FinalizeStep

**Purpose:** Write variant metadata.

```typescript
execute(ctx: BuildContext): void {
  const { paths, params, provider, state, report } = ctx;

  const metadata = {
    name: params.name,
    provider: provider.key,
    createdAt: new Date().toISOString(),
    binaryPath: path.join(paths.npmDir, 'node_modules/@anthropic-ai/claude-code/cli.js'),
    configDir: paths.configDir,
    version: state.installedVersion,
    brand: ctx.prefs.brandKey
  };

  fs.writeFileSync(
    path.join(paths.variantDir, 'variant.json'),
    JSON.stringify(metadata, null, 2)
  );

  report('Variant created successfully');
}
```

---

## Provider System

### Provider Template Structure

```typescript
// src/providers/index.ts
export interface ProviderTemplate {
  key: string;                        // Unique identifier
  label: string;                      // Display name
  description: string;                // Shown in TUI
  baseUrl: string;                    // API endpoint
  env: ProviderEnv;                   // Default environment
  apiKeyLabel: string;                // Prompt text
  authMode?: 'apiKey' | 'authToken' | 'none';
  requiresModelMapping?: boolean;     // e.g., OpenRouter
  credentialOptional?: boolean;       // e.g., mirror, ccrouter
  experimental?: boolean;
  noPromptPack?: boolean;             // Skip prompt overlays
}

export interface ProviderEnv {
  ANTHROPIC_BASE_URL?: string;
  ANTHROPIC_DEFAULT_SONNET_MODEL?: string;
  ANTHROPIC_DEFAULT_OPUS_MODEL?: string;
  ANTHROPIC_DEFAULT_HAIKU_MODEL?: string;
  DISABLE_AUTOUPDATER?: string;
  DISABLE_AUTO_MIGRATE_TO_NATIVE?: string;
  [key: string]: string | undefined;
}
```

### Provider Definitions

```typescript
export const MIRROR_PROVIDER: ProviderTemplate = {
  key: 'mirror',
  label: 'Mirror (Anthropic)',
  description: 'Uses your existing Anthropic account',
  baseUrl: '',  // Use default
  apiKeyLabel: 'Anthropic API Key (optional)',
  authMode: 'none',
  credentialOptional: true,
  noPromptPack: true,
  env: {}
};

export const ZAI_PROVIDER: ProviderTemplate = {
  key: 'zai',
  label: 'Z.ai',
  description: 'GLM models through Z.ai',
  baseUrl: 'https://api.z.ai/api/anthropic',
  apiKeyLabel: 'Z.ai API Key',
  authMode: 'apiKey',
  env: {
    ANTHROPIC_BASE_URL: 'https://api.z.ai/api/anthropic',
    ANTHROPIC_DEFAULT_SONNET_MODEL: 'glm-4.7',
    ANTHROPIC_DEFAULT_HAIKU_MODEL: 'glm-4.5-air',
    ANTHROPIC_DEFAULT_OPUS_MODEL: 'glm-4.7',
    DISABLE_AUTOUPDATER: '1',
    DISABLE_AUTO_MIGRATE_TO_NATIVE: '1',
    CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION: '1'
  }
};

export const OPENROUTER_PROVIDER: ProviderTemplate = {
  key: 'openrouter',
  label: 'OpenRouter',
  description: 'Access 100+ models',
  baseUrl: 'https://openrouter.ai/api',
  apiKeyLabel: 'OpenRouter API Key',
  authMode: 'authToken',
  requiresModelMapping: true,
  env: {
    ANTHROPIC_BASE_URL: 'https://openrouter.ai/api',
    DISABLE_AUTOUPDATER: '1'
  }
};

// All providers
export const PROVIDERS: ProviderTemplate[] = [
  MIRROR_PROVIDER,
  ZAI_PROVIDER,
  MINIMAX_PROVIDER,
  OPENROUTER_PROVIDER,
  CCROUTER_PROVIDER,
  CUSTOM_PROVIDER
];

export function getProvider(key: string): ProviderTemplate | undefined {
  return PROVIDERS.find(p => p.key === key);
}
```

---

## Brand and Theme System

### Brand Configuration

```typescript
// src/brands/types.ts
export interface BrandConfig {
  key: string;                        // Unique identifier
  label: string;                      // Display name
  themeId: string;                    // TweakCC theme ID
  blockedTools?: string[];            // Tools to disable
}

// src/brands/zai.ts
export const ZAI_BLOCKED_TOOLS = [
  'mcp__4_5v_mcp__analyze_image',
  'mcp__milk_tea_server__claim_milk_tea_coupon',
  'mcp__web_reader__webReader',
  'WebSearch',
  'WebFetch'
];

export const ZAI_BRAND: BrandConfig = {
  key: 'zai',
  label: 'Z.ai Carbon',
  themeId: 'zai-carbon',
  blockedTools: ZAI_BLOCKED_TOOLS
};
```

### Brand Resolution

```typescript
// src/brands/index.ts
const BRANDS: Record<string, BrandConfig> = {
  zai: ZAI_BRAND,
  minimax: MINIMAX_BRAND,
  openrouter: OPENROUTER_BRAND,
  ccrouter: CCROUTER_BRAND,
  mirror: MIRROR_BRAND
};

export function getBrandConfig(key: string): BrandConfig | undefined {
  return BRANDS[key];
}

export function resolveBrandForProvider(providerKey: string): string | undefined {
  // Auto-detect brand based on provider
  if (providerKey in BRANDS) {
    return providerKey;
  }
  return undefined;
}
```

---

## Prompt Pack System

### Overlay Structure

```typescript
// src/core/prompt-pack/providers/zai.ts
export const ZAI_OVERLAY = `
## Z.ai Integration

You are connected through Z.ai. The following tools are available:

- Use zai-cli search for web searches
- Use zai-cli read for fetching web content
- Use zai-cli vision for image analysis

Do not use WebSearch or WebFetch directly.
`;

// src/core/prompt-pack/overlays.ts
const OVERLAYS: Record<string, string> = {
  zai: ZAI_OVERLAY,
  minimax: MINIMAX_OVERLAY,
  default: DEFAULT_OVERLAY
};

export function getPromptOverlay(providerKey: string): string | undefined {
  return OVERLAYS[providerKey] || OVERLAYS.default;
}
```

### Overlay Application

Overlays are appended to system prompt files in `tweakcc/system-prompts/` after TweakCC runs, then TweakCC is re-run to apply the combined prompts.

---

## TUI Architecture

### Application Structure

```tsx
// src/tui/app.tsx
export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<AppState>(initialState);

  return (
    <AppStateContext.Provider value={{ state, setState }}>
      <Box flexDirection="column">
        {screen === 'home' && (
          <HomeScreen onSelect={handleHomeSelect} />
        )}
        {screen === 'provider-select' && (
          <ProviderSelectScreen
            onSelect={provider => {
              setState(s => ({ ...s, provider }));
              setScreen('api-key');
            }}
            onBack={() => setScreen('home')}
          />
        )}
        {/* ... more screens */}
      </Box>
    </AppStateContext.Provider>
  );
}
```

### Screen Navigation

```typescript
// src/tui/router/routes.ts
export type Screen =
  | 'home'
  | 'provider-intro'
  | 'provider-select'
  | 'api-key'
  | 'model-config'
  | 'router-url'
  | 'env-editor'
  | 'team-mode'
  | 'summary'
  | 'progress'
  | 'completion'
  | 'variant-list'
  | 'variant-actions'
  | 'diagnostics'
  | 'about'
  | 'feedback';
```

### State Management

```typescript
// src/tui/state/types.ts
export interface AppState {
  mode: 'quick' | 'advanced';
  provider?: string;
  apiKey?: string;
  variantName?: string;
  baseUrl?: string;
  modelMapping?: ModelMapping;
  extraEnv?: Record<string, string>;
  selectedVariant?: string;
}

// src/tui/state/context.ts
export const AppStateContext = createContext<{
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}>(null!);

export function useAppState() {
  return useContext(AppStateContext);
}
```

---

## Configuration Management

### settings.json

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-...",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "DISABLE_AUTOUPDATER": "1",
    "CUSTOM_VAR": "value"
  }
}
```

### .claude.json

```json
{
  "hasCompletedOnboarding": true,
  "theme": "zai-carbon",
  "customApiKeyResponses": {
    "approved": ["...last20chars..."]
  },
  "mcpServers": {
    "minimax-coding-plan": {
      "command": "npx",
      "args": ["@anthropic-ai/minimax-mcp"]
    }
  }
}
```

### variant.json

```json
{
  "name": "my-variant",
  "provider": "zai",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "binaryPath": "/Users/me/.claude-sneakpeek/my-variant/npm/node_modules/@anthropic-ai/claude-code/cli.js",
  "configDir": "/Users/me/.claude-sneakpeek/my-variant/config",
  "version": "2.1.22",
  "brand": "zai"
}
```

### tweakcc/config.json

```json
{
  "preset": "zai",
  "themes": ["zai-carbon"],
  "toolsets": {
    "blocked": ["WebSearch", "WebFetch"]
  }
}
```

---

## Wrapper Script Generation

### Unix Wrapper (bash)

```bash
#!/usr/bin/env bash
# claude-sneakpeek variant: my-variant
# Provider: zai

export CLAUDE_CONFIG_DIR="/Users/me/.claude-sneakpeek/my-variant/config"

# Load settings.json into environment
while IFS='=' read -r key value; do
  export "$key"="$value"
done < <(node -e "
  const s = require('/Users/me/.claude-sneakpeek/my-variant/config/settings.json');
  Object.entries(s.env || {}).forEach(([k,v]) => console.log(k + '=' + v));
")

# Show splash (if TTY and enabled)
if [ -t 1 ] && [ "${CLAUDE_SNEAKPEEK_SPLASH:-1}" != "0" ]; then
  echo "   ____          ___  ___
  / __ \\___  ___ |_  |/ _ |
 / /_/ / _ \\/ -_)/ __/ __ |
 \\____/ .__/\\__/____/_/ |_|
     /_/

  Connected to Z.ai"
fi

exec node "/Users/me/.claude-sneakpeek/my-variant/npm/node_modules/@anthropic-ai/claude-code/cli.js" "$@"
```

### Windows Wrapper (cmd)

```batch
@echo off
REM claude-sneakpeek variant: my-variant
REM Provider: zai

set "CLAUDE_CONFIG_DIR=%USERPROFILE%\.claude-sneakpeek\my-variant\config"

REM Load settings from JSON
for /f "tokens=1,* delims==" %%a in ('node -e "const s = require('%CLAUDE_CONFIG_DIR%\\settings.json'); Object.entries(s.env || {}).forEach(([k,v]) => console.log(k + '=' + v));"') do set "%%a=%%b"

node "%USERPROFILE%\.claude-sneakpeek\my-variant\npm\node_modules\@anthropic-ai\claude-code\cli.js" %*
```

---

## Testing Architecture

### Test Categories

```
test/
├── e2e/           # Full integration tests
│   └── Creates real variants, runs commands
│
├── tui/           # Component tests
│   └── Renders screens, tests interactions
│
├── cli/           # Argument parsing, output
│   └── parseArgs, formatters, help text
│
├── core/          # Business logic
│   └── Path resolution, file ops, steps
│
└── unit/          # Isolated functions
    └── Pure functions, utilities
```

### Test Utilities

```typescript
// test/helpers/index.ts
export function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'claude-sneakpeek-test-'));
}

export function cleanupTempDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

export async function createTestVariant(opts: Partial<CreateVariantParams>) {
  const tempDir = createTempDir();
  return createVariantAsync({
    rootDir: tempDir,
    name: 'test-variant',
    provider: 'mirror',
    ...opts
  });
}
```

---

## Extension Points

### Adding a Provider

1. Define in `src/providers/index.ts`
2. Add brand in `src/brands/`
3. Add prompt overlay in `src/core/prompt-pack/providers/`
4. Add tests in `test/e2e/`

### Adding a Build Step

1. Create class in `src/core/variant-builder/steps/`
2. Implement `BuildStep` interface
3. Register in `VariantBuilder.ts` (order matters)
4. Add tests

### Adding a TUI Screen

1. Create component in `src/tui/screens/`
2. Add to `Screen` type in `router/routes.ts`
3. Wire navigation in `app.tsx`
4. Add tests in `test/tui/`

### Adding a CLI Command

1. Create handler in `src/cli/commands/`
2. Add routing in `src/cli/index.ts`
3. Update help text
4. Add tests in `test/cli/`

---

## Security Considerations

### API Key Storage

- Keys stored in `settings.json` (user-readable only)
- Last 20 chars stored in `.claude.json` for approval
- Keys never logged or printed in full

### File Permissions

- Wrapper scripts: 0o755 (executable)
- Config files: User-only read/write
- No root/admin privileges required

### Network Security

- All HTTPS (provider APIs)
- No telemetry or analytics
- Keys transmitted only to configured providers

### Input Validation

- Variant names sanitized (alphanumeric + dash)
- Paths validated before use
- No shell injection in wrapper scripts

---

## Summary

This architecture provides:

1. **Clean separation** between UI (CLI/TUI), core logic, and file operations
2. **Extensible build system** via composable steps
3. **Flexible provider support** through templates
4. **Comprehensive testing** at multiple levels
5. **Cross-platform compatibility** for Windows, macOS, Linux

The modular design makes it straightforward to add features, fix bugs, and maintain the codebase over time.
