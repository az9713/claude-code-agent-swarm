# Complete User Guide

This guide covers everything you need to know to use claude-sneakpeek effectively. No prior experience with Claude Code or AI tools is assumed.

---

## Table of Contents

1. [What is claude-sneakpeek?](#what-is-claude-sneakpeek)
2. [Key Concepts](#key-concepts)
3. [System Requirements](#system-requirements)
4. [Installation](#installation)
5. [Providers Explained](#providers-explained)
6. [Creating Variants](#creating-variants)
7. [Managing Variants](#managing-variants)
8. [Configuration Files](#configuration-files)
9. [The TUI Wizard](#the-tui-wizard)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)
12. [Related Resources](#related-resources)

---

## What is claude-sneakpeek?

### The Problem It Solves

Claude Code is Anthropic's AI coding assistant that runs in your terminal. It's powerful, but some features are "feature-flagged" — they exist in the code but aren't turned on for regular users yet.

claude-sneakpeek creates a separate installation of Claude Code with these hidden features unlocked:

- **Swarm Mode** — Multiple AI agents working together simultaneously
- **Delegate Mode** — Spawn background agents while you keep working
- **Team Coordination** — Agents can communicate and share tasks

### How It Works (Simple Explanation)

Imagine Claude Code as a house. The official version has some rooms locked. claude-sneakpeek makes a copy of that house with all the rooms unlocked.

Your original Claude Code installation is completely untouched. Each "variant" you create is a separate house with its own keys, settings, and data.

### Is It Safe?

Yes. claude-sneakpeek:
- Doesn't modify your original Claude Code
- Stores everything in `~/.claude-sneakpeek/` (a hidden folder in your home directory)
- Uses official Claude Code releases from npm
- Is open source so anyone can inspect the code

---

## Key Concepts

### What is a "Variant"?

A variant is an isolated Claude Code installation. Think of it like having multiple web browsers installed — they share nothing with each other.

Each variant has:
- Its own name (e.g., `claudesp`, `work-claude`, `zai-claude`)
- Its own configuration files
- Its own API keys and settings
- Its own command to launch it

### What is a "Provider"?

A provider determines which AI backend your variant connects to:

| Provider | Description | Best For |
|----------|-------------|----------|
| **mirror** | Uses your normal Anthropic account | Most users |
| **zai** | Connects to Z.ai (GLM models) | Alternative models |
| **minimax** | Connects to MiniMax AI | Alternative models |
| **openrouter** | Gateway to 100+ models | Model variety |
| **ccrouter** | Local models (Ollama, etc.) | Privacy, offline work |
| **custom** | Any OpenAI-compatible API | Enterprise, self-hosted |

### What is a "Wrapper Script"?

When you create a variant named `claudesp`, claude-sneakpeek creates a small script file that:
1. Sets up the right environment variables
2. Points to the variant's config folder
3. Launches Claude Code

This script is what you run when you type `claudesp` in your terminal.

---

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **Operating System** | Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+, Debian 10+) |
| **Node.js** | Version 18.0.0 or higher |
| **npm** | Version 8.0.0 or higher (comes with Node.js) |
| **Disk Space** | ~500 MB per variant |
| **RAM** | 4 GB minimum, 8 GB recommended |
| **Internet** | Required for installation and API calls |

### Checking Your System

**Check Node.js version:**
```bash
node --version
# Should show v18.0.0 or higher
```

**Check npm version:**
```bash
npm --version
# Should show 8.0.0 or higher
```

### Installing Node.js

#### Windows

1. Go to https://nodejs.org
2. Click the green "LTS" button (Long Term Support)
3. Run the downloaded `.msi` file
4. Click "Next" through all prompts
5. Restart your terminal (Command Prompt, PowerShell, or Windows Terminal)

#### macOS

**Option 1: Homebrew (Recommended)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option 2: Official Installer**
1. Go to https://nodejs.org
2. Download the macOS installer
3. Run the `.pkg` file and follow prompts

#### Linux (Ubuntu/Debian)

```bash
# Update package manager
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Linux (Fedora/RHEL)

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

---

## Installation

### Quick Installation (Recommended)

This creates a variant called `claudesp` using the mirror provider (your normal Anthropic account):

```bash
npx @realmikekelly/claude-sneakpeek quick --name claudesp
```

**What happens:**
1. Downloads claude-sneakpeek (first time only)
2. Downloads Claude Code into `~/.claude-sneakpeek/claudesp/npm/`
3. Creates config files in `~/.claude-sneakpeek/claudesp/config/`
4. Creates wrapper script at `~/.local/bin/claudesp`

**Expected output:**
```
Creating variant 'claudesp' with provider 'mirror'...

✓ Preparing directories
✓ Installing Claude Code (this may take a minute)
✓ Writing configuration
✓ Applying theme
✓ Creating wrapper script
✓ Updating shell environment

Done! Run 'claudesp' to launch.
```

### Setting Up Your PATH

The wrapper script is created in `~/.local/bin/` (macOS/Linux) or `~/.claude-sneakpeek/bin/` (Windows). Your terminal needs to know to look there.

#### macOS/Linux (Zsh - default on modern macOS)

```bash
# Add to your shell profile
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc

# Reload your profile
source ~/.zshrc
```

#### macOS/Linux (Bash)

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### Windows

The installer should add the bin directory automatically. If not:

1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Click "Advanced" tab
3. Click "Environment Variables"
4. Under "User variables", find "Path" and click "Edit"
5. Click "New" and add: `%USERPROFILE%\.claude-sneakpeek\bin`
6. Click "OK" on all dialogs
7. Restart your terminal

### Verifying Installation

```bash
# Should launch Claude Code
claudesp

# Or check the variant exists
npx @realmikekelly/claude-sneakpeek list
```

---

## Providers Explained

### Mirror Provider (Default)

**What it is:** Uses your existing Anthropic account and Claude subscription.

**When to use:** You have a Claude Pro/Team subscription and want the unlocked features.

**Setup:**
```bash
npx @realmikekelly/claude-sneakpeek quick --name claudesp
```

**Authentication:** When you first run `claudesp`, it will open a browser for you to log into your Anthropic account.

---

### Z.ai Provider

**What it is:** Alternative AI provider using GLM models (developed by Zhipu AI).

**When to use:** You want to try different AI models or don't have an Anthropic subscription.

**Setup:**
1. Create an account at https://z.ai
2. Get your API key from the dashboard
3. Run:
```bash
npx @realmikekelly/claude-sneakpeek create --provider zai --name zai-claude --api-key YOUR_KEY
```

**Model mapping:**
- Sonnet → GLM-4.7
- Haiku → GLM-4.5-Air
- Opus → GLM-4.7 (same as Sonnet)

---

### MiniMax Provider

**What it is:** Alternative AI provider using MiniMax models.

**When to use:** You want to try MiniMax's AI models.

**Setup:**
1. Create an account at https://minimax.io
2. Get your API key
3. Run:
```bash
npx @realmikekelly/claude-sneakpeek create --provider minimax --name minimax-claude --api-key YOUR_KEY
```

---

### OpenRouter Provider

**What it is:** A gateway that gives you access to 100+ AI models from different providers.

**When to use:** You want to switch between different models (GPT-4, Claude, Llama, Mixtral, etc.).

**Setup:**
1. Create an account at https://openrouter.ai
2. Add credits and get your API key
3. Run:
```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider openrouter \
  --name or-claude \
  --api-key YOUR_KEY \
  --model-sonnet "anthropic/claude-3.5-sonnet" \
  --model-haiku "anthropic/claude-3-haiku" \
  --model-opus "anthropic/claude-3-opus"
```

**Popular model choices:**
```bash
# Use GPT-4 Turbo
--model-sonnet "openai/gpt-4-turbo"

# Use Llama 3
--model-haiku "meta-llama/llama-3-70b-instruct"

# Use Mixtral
--model-sonnet "mistralai/mixtral-8x22b-instruct"
```

---

### CCRouter Provider

**What it is:** Routes requests to local AI models running on your computer (Ollama, LM Studio, etc.).

**When to use:** Privacy-focused work, offline usage, or testing local models.

**Prerequisites:**
1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3`
3. Install and run CCRouter: `npx cc-router`

**Setup:**
```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider ccrouter \
  --name local-claude \
  --base-url "http://127.0.0.1:3456"
```

---

### Custom Provider

**What it is:** Connect to any OpenAI-compatible API.

**When to use:** Enterprise setups, self-hosted models, or APIs not listed above.

**Setup:**
```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider custom \
  --name my-custom \
  --base-url "https://your-api.example.com/v1" \
  --api-key "your-api-key" \
  --model-sonnet "your-model-name"
```

---

## Creating Variants

### Method 1: Quick Command (Simplest)

```bash
npx @realmikekelly/claude-sneakpeek quick --name NAME
```

This uses the mirror provider with default settings.

### Method 2: Create Command (More Control)

```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider PROVIDER \
  --name NAME \
  --api-key YOUR_KEY
```

### Method 3: Interactive TUI (Visual)

```bash
npx @realmikekelly/claude-sneakpeek --tui
```

Use arrow keys to navigate, Enter to select.

### All Create Command Options

| Flag | Description | Example |
|------|-------------|---------|
| `--provider` | Provider type | `--provider zai` |
| `--name` | Variant name | `--name work-claude` |
| `--api-key` | API key | `--api-key sk-xxx` |
| `--base-url` | Custom API URL | `--base-url https://api.example.com` |
| `--model-sonnet` | Model for "sonnet" | `--model-sonnet gpt-4-turbo` |
| `--model-opus` | Model for "opus" | `--model-opus claude-3-opus` |
| `--model-haiku` | Model for "haiku" | `--model-haiku claude-3-haiku` |
| `--brand` | Theme preset | `--brand zai` |
| `--no-tweak` | Skip theming | `--no-tweak` |
| `--no-prompt-pack` | Skip prompt overlays | `--no-prompt-pack` |
| `--no-skill-install` | Skip skill install | `--no-skill-install` |
| `--env` | Extra env var | `--env "KEY=value"` |
| `--yes` | Non-interactive mode | `--yes` |

### Examples

**Create a Z.ai variant with custom name:**
```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider zai \
  --name my-zai \
  --api-key "your-zai-api-key"
```

**Create an OpenRouter variant with specific models:**
```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider openrouter \
  --name gpt4-claude \
  --api-key "your-openrouter-key" \
  --model-sonnet "openai/gpt-4-turbo" \
  --model-haiku "openai/gpt-3.5-turbo"
```

**Create a mirror variant with extra environment variables:**
```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider mirror \
  --name dev-claude \
  --env "DEBUG=true" \
  --env "LOG_LEVEL=verbose"
```

---

## Managing Variants

### List All Variants

```bash
npx @realmikekelly/claude-sneakpeek list
```

**Output:**
```
Installed variants:
  claudesp (mirror) - created 2024-01-15
  zai-claude (zai) - created 2024-01-16
  work-claude (openrouter) - created 2024-01-17
```

### Update a Single Variant

```bash
npx @realmikekelly/claude-sneakpeek update NAME
```

This:
1. Downloads the latest Claude Code
2. Preserves your config and settings
3. Reapplies themes and customizations

### Update All Variants

```bash
npx @realmikekelly/claude-sneakpeek update
```

### Remove a Variant

```bash
npx @realmikekelly/claude-sneakpeek remove NAME
```

**Warning:** This permanently deletes:
- The variant directory (`~/.claude-sneakpeek/NAME/`)
- The wrapper script (`~/.local/bin/NAME`)

### Health Check

```bash
npx @realmikekelly/claude-sneakpeek doctor
```

This checks all variants for:
- Missing files
- Invalid configuration
- Broken wrapper scripts
- Outdated installations

### Customize Theme

```bash
npx @realmikekelly/claude-sneakpeek tweak NAME
```

Opens the TweakCC interface where you can:
- Change colors
- Switch themes
- Customize appearance

---

## Configuration Files

### Where Everything Lives

```
~/.claude-sneakpeek/
├── claudesp/                    # Your variant
│   ├── config/
│   │   ├── settings.json        # Environment variables
│   │   ├── .claude.json         # Claude Code settings
│   │   └── skills/              # Installed skills
│   ├── tweakcc/
│   │   ├── config.json          # Theme configuration
│   │   └── system-prompts/      # Custom prompts
│   ├── npm/
│   │   └── node_modules/        # Claude Code installation
│   └── variant.json             # Variant metadata
├── another-variant/
│   └── ...
└── bin/                         # Windows wrapper scripts
```

### settings.json

This file contains environment variables loaded when you run the variant:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "your-api-key",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "DISABLE_AUTOUPDATER": "1",
    "MY_CUSTOM_VAR": "value"
  }
}
```

**To modify:** Edit the file directly or use `--env` flags during creation.

### .claude.json

This file contains Claude Code's internal settings:

```json
{
  "hasCompletedOnboarding": true,
  "theme": "zai-carbon",
  "customApiKeyResponses": {
    "approved": ["...last20chars..."]
  },
  "mcpServers": {}
}
```

**Usually don't edit this directly** — it's managed by Claude Code.

### variant.json

Metadata about the variant:

```json
{
  "name": "claudesp",
  "provider": "mirror",
  "createdAt": "2024-01-15T10:30:00Z",
  "binaryPath": "/Users/you/.claude-sneakpeek/claudesp/npm/node_modules/@anthropic-ai/claude-code/cli.js",
  "configDir": "/Users/you/.claude-sneakpeek/claudesp/config"
}
```

---

## The TUI Wizard

### Launching the TUI

```bash
npx @realmikekelly/claude-sneakpeek --tui
```

### Navigation

| Key | Action |
|-----|--------|
| ↑/↓ | Move selection |
| Enter | Select option |
| Backspace | Go back |
| q | Quit |
| Ctrl+C | Force quit |

### Main Menu Options

1. **Quick Setup** — Fastest path to a working variant
2. **New Variant** — Full wizard with all options
3. **Manage Variants** — Update or remove existing variants
4. **Update All** — Update every variant at once
5. **Diagnostics** — Run health check
6. **About** — Version info
7. **Feedback** — Links to report issues

### Quick Setup Flow

1. Choose provider (mirror, zai, minimax, openrouter, ccrouter, custom)
2. Enter API key (if required)
3. Enter variant name
4. Review and confirm
5. Watch progress
6. See completion message with next steps

### New Variant Flow (Advanced)

1. Provider introduction/education
2. Choose provider
3. Enter API key
4. Configure models (if applicable)
5. Enter router URL (if CCRouter)
6. Add extra environment variables
7. Review all settings
8. Confirm and create

---

## Troubleshooting

### "Command not found" after installation

**Cause:** The wrapper script location isn't in your PATH.

**Fix:**
```bash
# macOS/Linux (Zsh)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# macOS/Linux (Bash)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Windows: Restart terminal, or add path manually (see Installation section)
```

### "Permission denied" when running variant

**Cause:** The wrapper script isn't executable.

**Fix (macOS/Linux):**
```bash
chmod +x ~/.local/bin/VARIANT_NAME
```

### Variant won't start

**Cause:** Installation may be corrupted.

**Fix:**
```bash
# Check health
npx @realmikekelly/claude-sneakpeek doctor

# If it shows errors, try updating
npx @realmikekelly/claude-sneakpeek update VARIANT_NAME

# Or remove and recreate
npx @realmikekelly/claude-sneakpeek remove VARIANT_NAME
npx @realmikekelly/claude-sneakpeek quick --name VARIANT_NAME
```

### API key not working

**Cause:** Key might be invalid, expired, or for wrong provider.

**Fix:**
1. Verify key on provider's website
2. Check `~/.claude-sneakpeek/VARIANT_NAME/config/settings.json`
3. Update the key:
```bash
# Edit settings.json and change ANTHROPIC_API_KEY
# Or recreate the variant with correct key
```

### "EACCES" permission errors during install

**Cause:** npm doesn't have permission to write to the directory.

**Fix:**
```bash
# Option 1: Fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Option 2: Use a Node version manager like nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Slow installation

**Cause:** npm is downloading packages (normal for first install).

**What to expect:**
- First variant: 1-3 minutes
- Additional variants: 30-60 seconds (npm cache helps)

### TUI displays incorrectly

**Cause:** Terminal doesn't support the colors/characters used.

**Fix:**
1. Try a different terminal (Windows Terminal, iTerm2, etc.)
2. Use the CLI commands instead of TUI:
```bash
npx @realmikekelly/claude-sneakpeek quick --name NAME
```

---

## FAQ

### Can I use multiple variants at the same time?

Yes! Each variant is completely independent. You can have `claudesp` running in one terminal and `zai-claude` in another.

### Will this affect my regular Claude Code installation?

No. claude-sneakpeek creates everything in `~/.claude-sneakpeek/`. Your global Claude Code installation (if any) is untouched.

### How do I switch API keys for an existing variant?

Edit the settings file:
```bash
# Open in your editor
code ~/.claude-sneakpeek/VARIANT_NAME/config/settings.json

# Or use nano/vim
nano ~/.claude-sneakpeek/VARIANT_NAME/config/settings.json
```

Change the `ANTHROPIC_API_KEY` value and save.

### Can I rename a variant?

Not directly. Create a new variant with the desired name and remove the old one:
```bash
npx @realmikekelly/claude-sneakpeek create --provider mirror --name new-name
npx @realmikekelly/claude-sneakpeek remove old-name
```

### How much disk space does each variant use?

Approximately 200-500 MB per variant, mostly from the Claude Code npm package.

### How do I know if a new Claude Code version is available?

Check https://www.npmjs.com/package/@anthropic-ai/claude-code for the latest version. Then update your variants:
```bash
npx @realmikekelly/claude-sneakpeek update
```

### What's the difference between swarm mode and regular Claude Code?

Regular Claude Code runs as a single agent. Swarm mode enables:
- Multiple agents working in parallel
- Background agents that work while you continue
- Agent-to-agent communication
- Task delegation and coordination

### Can I use claude-sneakpeek at work?

Check with your IT department. Some organizations have policies about:
- Running unofficial tool versions
- Sending code to third-party APIs
- Using personal AI subscriptions for work

### Is my code sent to Anthropic?

If you use the mirror provider, yes — same as regular Claude Code. If you use other providers (Z.ai, OpenRouter, local models), your code goes to those services instead.

### How do I report bugs?

Open an issue at: https://github.com/mikekelly/claude-sneakpeek/issues

Include:
- Your operating system
- Node.js version (`node --version`)
- The command that failed
- The error message

---

## Related Resources

### Official Claude Code Documentation

claude-sneakpeek builds on top of Claude Code. These official resources help you understand the underlying tool:

| Resource | URL | Description |
|----------|-----|-------------|
| **Claude Code Docs** | [docs.anthropic.com/claude-code](https://docs.anthropic.com/en/docs/claude-code) | Official documentation hub |
| **GitHub Repository** | [github.com/anthropics/claude-code](https://github.com/anthropics/claude-code) | Official repository |
| **CHANGELOG** | [CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) | Version history and features |
| **npm Package** | [npmjs.com/@anthropic-ai/claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code) | Latest releases |

### Version Compatibility

claude-sneakpeek requires **Claude Code 2.1.16+** for full swarm/multi-agent features:

| Claude Code Version | Key Features |
|---------------------|--------------|
| **2.1.16** | Task management system introduced (swarm foundation) |
| **2.1.17+** | Stability improvements for task coordination |

### claude-sneakpeek Documentation

| Document | Description |
|----------|-------------|
| [Quick Start Guide](QUICK-START.md) | Get started in 5 minutes |
| [Agent Swarm Guide](AGENT-SWARM-GUIDE.md) | Multi-agent capabilities explained |
| [Developer Guide](DEVELOPER-GUIDE.md) | Contributing to claude-sneakpeek |
| [Architecture Deep Dive](ARCHITECTURE-DEEP-DIVE.md) | Technical internals |

---

## Getting Help

1. **Check this guide** for common issues
2. **Run `doctor`** to diagnose problems
3. **Search existing issues** at GitHub
4. **Open a new issue** if needed

Happy coding!
