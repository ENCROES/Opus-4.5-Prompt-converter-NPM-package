# optimization-reviewer

> Domain-agnostic prompt framework for reviewing optimizations across code, prompts, processes, architectures, and workflows.

[![npm version](https://badge.fury.io/js/optimization-reviewer.svg)](https://www.npmjs.com/package/optimization-reviewer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install optimization-reviewer
```

Or globally for CLI access:
```bash
npm install -g optimization-reviewer
```

## Quick Start

### CLI

```bash
# Review a prompt
pre "You are a helpful assistant. Answer concisely."

# Review from file
pre -f my-prompt.md

# Pipe content
cat prompt.txt | pre

# Call Claude API directly
export ANTHROPIC_API_KEY=sk-ant-...
pre -f my-prompt.md --api
```

### Programmatic

```javascript
const { agentPrompt } = require('optimization-reviewer');

const response = await client.messages.create({
  model: 'claude-opus-4-5-20251101',
  max_tokens: 4096,
  system: agentPrompt,
  messages: [{ role: 'user', content: `Review this optimization:\n\n${code}` }]
});
```

## CLI Options

| Flag | Description |
|------|-------------|
| `-f, --file <path>` | Read from file |
| `-a, --agent` | Use agent format (default: human) |
| `-r, --raw` | Output raw system prompt |
| `-o, --output <path>` | Write to file |
| `-q, --quiet` | Suppress wrapper |
| `--api` | Call Claude API directly |
| `--model <model>` | Model (default: claude-opus-4-5-20251101) |
| `--max-tokens <n>` | Max tokens (default: 4096) |

## Exports

```typescript
// Prompts (lazy-loaded via getters)
export const humanPrompt: string;  // For chat interfaces
export const agentPrompt: string;  // For programmatic use
export const human: string;        // Alias
export const agent: string;        // Alias

// Explicit lazy-loading functions
export function getHumanPrompt(): string;
export function getAgentPrompt(): string;
```

## Two Prompt Versions

| Version | File | Use Case |
|---------|------|----------|
| Human | `optimization-reviewer-human.md` | Chat interfaces, verbose with examples |
| Agent | `optimization-reviewer-agent.toon` | Programmatic, token-efficient |

Both produce identical structured output. See [docs/toon-format.md](docs/toon-format.md) for the TOON format spec.

## More Documentation

- [Examples](docs/examples.md)
- [Customization](docs/customization.md)
- [TOON Format](docs/toon-format.md)

## Development

```bash
git clone https://github.com/ENCROES/Opus-4.5-Prompt-converter-NPM-package
cd Opus-4.5-Prompt-converter-NPM-package
npm test
npm run lint
```

## License

MIT © [ENCROES](https://github.com/ENCROES)
