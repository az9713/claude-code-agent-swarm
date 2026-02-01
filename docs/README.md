# CLAUDE-SNEAKPEEK Documentation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ╭─────╮╭─────╮    ╭───╮╭───╮╭───╮╭───────╮╭───────╮╭───────╮╭───────╮     │
│   │ ╭───╯│ ╭───╯    │ ╭╮╯│ ╭─╯╰─╮ ││ ╭─╮ ╭─╯│ ╭─╮ ╭─╯│ ╭───╮ ││ ╭─╮ ╭─╯     │
│   │ │    │ │   ╭────│ ││ │ │  ╭─╯ ││ ╰─╯ │  │ ╰─╯ │  │ │   │ ││ ╰─╯ │       │
│   │ ╰───╮│ ╰───╯    │ ╰╯╭╯ ╰──╯ ╭─╯│ ╭─╮ │  │ ╭─╮ │  │ ╰───╯ ││ ╭─╮ │       │
│   ╰─────╯╰─────╯    ╰───╯╰──────╯  ╰─╯ ╰─╯  ╰─╯ ╰─╯  ╰───────╯╰─╯ ╰─╯       │
│                                                                              │
│   Create multiple isolated Claude Code variants with custom providers        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 📚 Documentation Index

### 🚀 Start Here

| Document | Description | Audience |
|----------|-------------|----------|
| **[Quick Start Guide](QUICK-START.md)** | Install and create your first variant with 10+ hands-on examples | Users (all levels) |
| **[Agent Swarm Guide](AGENT-SWARM-GUIDE.md)** | Complete guide to multi-agent swarm mode with 6 detailed use cases | Users (all levels) |
| **[Swarm vs Native Comparison](SWARM-VS-NATIVE-COMPARISON.md)** | How claude-sneakpeek's swarm differs from official Claude Code agents | Users (all levels) |
| **[User Guide](USER-GUIDE.md)** | Complete user documentation covering all features | Users |
| **[Developer Guide](DEVELOPER-GUIDE.md)** | Contribute to claude-sneakpeek, add features, fix bugs | Developers |
| **[Architecture Deep Dive](ARCHITECTURE-DEEP-DIVE.md)** | Technical internals, data flows, component design | Developers |
| **[Implementation Details](IMPLEMENTATION-DETAILS.md)** | How each swarm feature is implemented with code snippets | Developers |

### ⚡ Quick Reference

| Document | Description |
|----------|-------------|
| [CLI Reference](reference/cli-reference.md) | All commands, flags, and options |
| [Configuration](reference/configuration.md) | All config files explained |
| [Environment Variables](reference/environment-variables.md) | Env var reference |
| [Providers](providers.md) | Provider options and setup |

### 🤖 Features

| Document | Description |
|----------|-------------|
| [Team Mode](features/team-mode.md) | Legacy team mode (claude-sneakpeek 1.6.3) |
| [Mirror Claude](features/mirror-claude.md) | Pure Claude Code with clean defaults |
| [Brand Themes](features/brand-themes.md) | Custom color schemes per provider |
| [Prompt Packs](features/prompt-packs.md) | Enhanced system prompts |
| [Tweakcc Guide](TWEAKCC-GUIDE.md) | Theme customization |

### 🏗️ Architecture

| Document | Description |
|----------|-------------|
| [Overview](architecture/overview.md) | How claude-sneakpeek works under the hood |
| [Provider System](architecture/provider-system.md) | Adding and configuring providers |
| [Variant Lifecycle](architecture/variant-lifecycle.md) | Create, update, and remove flows |

---

## 🗺️ Documentation Map

```
docs/
├── README.md                    ← You are here (index)
│
├── QUICK-START.md               # 🚀 Quick start with 10+ examples
├── AGENT-SWARM-GUIDE.md         # 🐝 Multi-agent swarm mode guide
├── SWARM-VS-NATIVE-COMPARISON.md # ⚖️ Swarm vs official Claude Code
├── USER-GUIDE.md                # 📖 Complete user documentation
├── DEVELOPER-GUIDE.md           # 👩‍💻 Developer onboarding
├── ARCHITECTURE-DEEP-DIVE.md    # 🔬 Technical architecture
├── IMPLEMENTATION-DETAILS.md    # 🔩 Feature implementation with code
│
├── providers.md                 # 🔌 Provider setup guide
├── TWEAKCC-GUIDE.md             # 🎨 Theme customization
│
├── features/
│   ├── team-mode.md             # 🤖 Multi-agent collaboration (legacy)
│   ├── mirror-claude.md         # 🪞 Pure Claude Code variant
│   ├── brand-themes.md          # 🎨 Custom themes
│   └── prompt-packs.md          # 📝 System prompt enhancements
│
├── architecture/
│   ├── overview.md              # 🏗️ System architecture
│   ├── provider-system.md       # 🔌 Provider configuration
│   └── variant-lifecycle.md     # 🔄 Create/update flows
│
├── reference/
│   ├── cli-reference.md         # 💻 CLI commands
│   ├── configuration.md         # ⚙️ Config files
│   └── environment-variables.md # 🔑 Env vars
│
└── research/
    └── native-multiagent-gates.md # 🔬 Feature gate research
```

---

## 💡 Which Doc Should I Read?

### I'm a User...

| Scenario | Start Here |
|----------|------------|
| "I've never used claude-sneakpeek" | [Quick Start Guide](QUICK-START.md) |
| "I want to use agent swarm" | [Agent Swarm Guide](AGENT-SWARM-GUIDE.md) |
| "How does swarm differ from official Claude Code?" | [Swarm vs Native Comparison](SWARM-VS-NATIVE-COMPARISON.md) |
| "I want to try different AI providers" | [Providers](providers.md) |
| "Something isn't working" | [User Guide → Troubleshooting](USER-GUIDE.md#troubleshooting) |
| "I want to customize the look" | [Tweakcc Guide](TWEAKCC-GUIDE.md) |

### I'm a Developer...

| Scenario | Start Here |
|----------|------------|
| "I want to contribute" | [Developer Guide](DEVELOPER-GUIDE.md) |
| "I'm new to TypeScript/Node.js" | [Developer Guide → Technology Stack](DEVELOPER-GUIDE.md#understanding-the-technology-stack) |
| "How does the build system work?" | [Architecture Deep Dive → Build Pipeline](ARCHITECTURE-DEEP-DIVE.md#the-build-pipeline) |
| "I want to add a new provider" | [Developer Guide → Adding a Provider](DEVELOPER-GUIDE.md#adding-a-new-provider) |
| "I want to add a new feature" | [Developer Guide → Adding Features](DEVELOPER-GUIDE.md#adding-features) |
| "How is swarm mode implemented?" | [Implementation Details](IMPLEMENTATION-DETAILS.md) |

---

## 📊 Provider Comparison

```
┌──────────────┬─────────────────┬──────────────┬────────────┐
│   Provider   │     Model       │  Auth Mode   │ Prompt Pack│
├──────────────┼─────────────────┼──────────────┼────────────┤
│ mirror       │ Claude (native) │ OAuth/Key    │ ✗ Pure     │
│ zai          │ GLM-4.7         │ API Key      │ ✓ Full     │
│ minimax      │ MiniMax-M2.1    │ API Key      │ ✓ Full     │
│ openrouter   │ You choose      │ Auth Token   │ ✗          │
│ ccrouter     │ Local LLMs      │ Optional     │ ✗          │
│ custom       │ Your API        │ API Key      │ ✗          │
└──────────────┴─────────────────┴──────────────┴────────────┘
```

---

## 📦 Version Compatibility

claude-sneakpeek works with **Claude Code 2.1.16+**. Key versions:

| Version | Feature |
|---------|---------|
| **2.1.16** | Task management system (swarm foundation) |
| **2.1.17+** | Stability and bug fixes |

---

## 📚 Official Claude Code Resources

| Resource | Description |
|----------|-------------|
| [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) | Official documentation |
| [GitHub Repository](https://github.com/anthropics/claude-code) | Source and issues |
| [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) | Version history |
| [npm Package](https://www.npmjs.com/package/@anthropic-ai/claude-code) | Latest releases |

---

## 🆘 Getting Help

1. **Check the [Quick Start Guide](QUICK-START.md)** for common workflows
2. **Check the [User Guide Troubleshooting](USER-GUIDE.md#troubleshooting)** for solutions
3. **Run `npx @realmikekelly/claude-sneakpeek doctor`** to diagnose issues
4. **Search [GitHub Issues](https://github.com/mikekelly/claude-sneakpeek/issues)** for similar problems
5. **Open a new issue** with your error message and system info

---

<p align="center">
  <strong>Fork of <a href="https://github.com/numman-ali/cc-mirror">cc-mirror</a> by Numman Ali</strong>
</p>
