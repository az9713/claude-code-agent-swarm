# Quick Start Guide

Welcome to claude-sneakpeek! This guide will get you up and running in minutes with 10+ hands-on examples.

## What is claude-sneakpeek?

claude-sneakpeek lets you run Claude Code with unlocked features that aren't publicly released yet:

- **Swarm Mode** — Multiple AI agents working together on your codebase
- **Delegate Mode** — Background agents that work while you continue coding
- **Team Coordination** — Agents can message each other and share tasks

Think of it as creating a "parallel universe" Claude Code that has all the experimental features turned on.

**Version Note:** The swarm feature requires Claude Code 2.1.16+ (released early 2025). This version introduced the task management system that powers multi-agent coordination. claude-sneakpeek automatically installs a compatible version.

---

## Prerequisites

Before starting, you need:

1. **Node.js 18 or higher** — Check with `node --version`
2. **npm** — Comes with Node.js, check with `npm --version`
3. **A terminal** — Command Prompt, PowerShell, Terminal, iTerm, etc.

### Installing Node.js (if needed)

**Windows:**
1. Go to https://nodejs.org
2. Download the "LTS" version (green button)
3. Run the installer, click "Next" through all steps
4. Restart your terminal

**macOS:**
```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Installation (One Command)

Open your terminal and run:

```bash
npx @realmikekelly/claude-sneakpeek quick --name claudesp
```

This will:
1. Download claude-sneakpeek
2. Install Claude Code in an isolated directory
3. Create a `claudesp` command you can run

**Expected output:**
```
✓ Preparing directories
✓ Installing Claude Code
✓ Writing configuration
✓ Applying theme
✓ Creating wrapper script
✓ Done!

Run 'claudesp' to launch your new Claude Code variant.
```

### Adding to PATH (First Time Only)

**macOS/Linux:** Add the bin directory to your PATH:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

**Windows:** The installer adds `~/.claude-sneakpeek/bin` automatically. If not working, restart your terminal.

---

## Your First Launch

```bash
claudesp
```

You should see Claude Code start up. Try asking it something simple like "Hello, what features do you have?"

---

## 10 Educational Use Cases

These examples go from simple to advanced. Each one teaches you something new about claude-sneakpeek.

### Use Case 1: Create Your First Variant (Mirror Mode)

**Goal:** Create a clean Claude Code variant that uses your existing Anthropic account.

```bash
npx @realmikekelly/claude-sneakpeek quick --name myclone
```

**What you learn:**
- Variants are independent Claude Code installations
- "Mirror" mode uses your normal Anthropic authentication
- You now have `myclone` command available

**Try it:**
```bash
myclone
```

---

### Use Case 2: Create a Z.ai Variant

**Goal:** Use Claude through the Z.ai provider (different model, different API).

```bash
npx @realmikekelly/claude-sneakpeek create --provider zai --name zai-claude --api-key YOUR_ZAI_API_KEY
```

**What you learn:**
- Different providers connect to different AI backends
- Z.ai uses GLM models behind the scenes
- API keys are stored securely in the variant's config

**Where to get a Z.ai API key:** Visit https://z.ai and create an account.

---

### Use Case 3: List All Your Variants

**Goal:** See what variants you've created.

```bash
npx @realmikekelly/claude-sneakpeek list
```

**Expected output:**
```
Installed variants:
  claudesp (mirror)
  myclone (mirror)
  zai-claude (zai)
```

**What you learn:**
- You can have multiple variants side-by-side
- Each variant shows its provider type

---

### Use Case 4: Run the Health Check

**Goal:** Verify all your variants are working correctly.

```bash
npx @realmikekelly/claude-sneakpeek doctor
```

**Expected output:**
```
Checking variants...

claudesp:
  ✓ Variant directory exists
  ✓ Config file valid
  ✓ Wrapper script executable
  ✓ Claude Code installed

All variants healthy!
```

**What you learn:**
- The `doctor` command diagnoses problems
- Run this if something isn't working

---

### Use Case 5: Update a Variant

**Goal:** Get the latest Claude Code version for your variant.

```bash
npx @realmikekelly/claude-sneakpeek update claudesp
```

**What you learn:**
- Updates refresh the Claude Code binary
- Your config and settings are preserved
- Run this periodically to stay current

**Update ALL variants at once:**
```bash
npx @realmikekelly/claude-sneakpeek update
```

---

### Use Case 6: Use the Interactive TUI Wizard

**Goal:** Create a variant using the visual wizard instead of command-line flags.

```bash
npx @realmikekelly/claude-sneakpeek --tui
```

**What you'll see:**
1. A menu with options (Quick Setup, New Variant, Manage, etc.)
2. Arrow keys to navigate, Enter to select
3. Step-by-step prompts for each setting

**What you learn:**
- The TUI is great for exploring options
- You don't need to memorize command flags
- Press `q` or `Ctrl+C` to exit

---

### Use Case 7: Create a Variant with OpenRouter

**Goal:** Access 100+ models through OpenRouter (GPT-4, Llama, Mixtral, etc.).

```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider openrouter \
  --name openrouter-claude \
  --api-key YOUR_OPENROUTER_API_KEY \
  --model-sonnet "anthropic/claude-3.5-sonnet"
```

**What you learn:**
- OpenRouter is a gateway to many AI models
- You can map specific models to Claude's sonnet/opus/haiku slots
- Get an API key at https://openrouter.ai

**Try different models:**
```bash
# Use GPT-4 as "sonnet"
--model-sonnet "openai/gpt-4-turbo"

# Use Llama as "haiku" (fast/cheap)
--model-haiku "meta-llama/llama-3-70b-instruct"
```

---

### Use Case 8: Customize with Extra Environment Variables

**Goal:** Add custom configuration to your variant.

```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider mirror \
  --name custom-claude \
  --env "CLAUDE_CODE_MAX_TOKENS=100000" \
  --env "MY_CUSTOM_VAR=hello"
```

**What you learn:**
- The `--env` flag adds environment variables
- These are stored in `settings.json`
- You can add multiple `--env` flags

**View your variant's config:**
```bash
cat ~/.claude-sneakpeek/custom-claude/config/settings.json
```

---

### Use Case 9: Remove a Variant

**Goal:** Clean up a variant you no longer need.

```bash
npx @realmikekelly/claude-sneakpeek remove zai-claude
```

**What you learn:**
- Removal deletes the variant directory and wrapper script
- Your other variants are unaffected
- This is permanent (no undo)

---

### Use Case 10: Launch the Theme Customizer

**Goal:** Change the visual appearance of your Claude Code variant.

```bash
npx @realmikekelly/claude-sneakpeek tweak claudesp
```

**What you'll see:**
- The TweakCC interface opens
- Browse available themes and colors
- Changes apply immediately

**What you learn:**
- Each variant can have its own look
- Themes are managed by TweakCC
- This doesn't affect functionality, just appearance

---

## Bonus Use Cases

### Use Case 11: Create a Local-Only Variant with CCRouter

**Goal:** Run Claude Code against local models (Ollama, LM Studio, etc.).

First, install and run CCRouter (https://github.com/anthropics/cc-router):
```bash
# In another terminal
npx cc-router
```

Then create your variant:
```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider ccrouter \
  --name local-claude \
  --base-url "http://127.0.0.1:3456"
```

**What you learn:**
- CCRouter bridges Claude Code to local models
- No API key needed (runs on your machine)
- Great for offline work or privacy

---

### Use Case 12: Create a Fully Custom Provider

**Goal:** Connect to any OpenAI-compatible API.

```bash
npx @realmikekelly/claude-sneakpeek create \
  --provider custom \
  --name my-custom \
  --base-url "https://my-api.example.com/v1" \
  --api-key "my-api-key" \
  --model-sonnet "my-model-name"
```

**What you learn:**
- The "custom" provider works with any API
- You control the base URL and model names
- Perfect for self-hosted or enterprise setups

---

## What's Next?

Now that you've completed these use cases:

1. **Read the User Guide** (`docs/USER-GUIDE.md`) for complete documentation
2. **Explore Swarm Mode** — Ask your variant "What is swarm mode and how do I use it?"
3. **Try Multi-Agent Tasks** — Ask Claude to spawn background agents for complex work
4. **Join the Community** — Report issues at https://github.com/mikekelly/claude-sneakpeek/issues

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Command not found after install | Add `~/.local/bin` to your PATH (see Installation) |
| "Permission denied" on macOS/Linux | Run `chmod +x ~/.local/bin/claudesp` |
| Variant won't start | Run `npx @realmikekelly/claude-sneakpeek doctor` |
| API key not working | Check the key in `~/.claude-sneakpeek/<name>/config/settings.json` |
| Want to start fresh | Run `npx @realmikekelly/claude-sneakpeek remove <name>` then recreate |

---

## Command Cheat Sheet

```bash
# Quick install
npx @realmikekelly/claude-sneakpeek quick --name NAME

# Interactive wizard
npx @realmikekelly/claude-sneakpeek --tui

# Create with provider
npx @realmikekelly/claude-sneakpeek create --provider PROVIDER --name NAME --api-key KEY

# List all variants
npx @realmikekelly/claude-sneakpeek list

# Update one variant
npx @realmikekelly/claude-sneakpeek update NAME

# Update all variants
npx @realmikekelly/claude-sneakpeek update

# Remove a variant
npx @realmikekelly/claude-sneakpeek remove NAME

# Health check
npx @realmikekelly/claude-sneakpeek doctor

# Theme customizer
npx @realmikekelly/claude-sneakpeek tweak NAME
```

---

## Related Resources

| Resource | Description |
|----------|-------------|
| [Agent Swarm Guide](AGENT-SWARM-GUIDE.md) | Deep dive into multi-agent swarm mode |
| [User Guide](USER-GUIDE.md) | Complete documentation for all features |
| [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) | Official Anthropic documentation |
| [Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) | Version history (2.1.16 = swarm feature) |

Happy coding with your new superpowered Claude Code!
