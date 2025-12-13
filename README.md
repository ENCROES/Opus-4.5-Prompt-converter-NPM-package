# optimization-reviewer

> A comprehensive, domain-agnostic prompt for reviewing and improving optimizations. Works with any optimization type—code, prompts, processes, architectures, workflows, or hybrids.

[![npm version](https://badge.fury.io/js/optimization-reviewer.svg)](https://www.npmjs.com/package/optimization-reviewer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why This Exists

Most code review tools only review code. Most prompt optimizers only optimize prompts. But real-world optimizations often span domains—a prompt that generates code, a workflow that includes architecture decisions, a process that automates via scripts.

**optimization-reviewer** provides a single, adaptive framework that:

- **Detects** what type(s) of optimization you're reviewing
- **Applies** relevant evaluation criteria for each detected type
- **Produces** actionable fixes, not just criticism
- **Prioritizes** thoroughness while remaining constructive

---

## Two Versions, One Framework

This package includes two prompt variants built from the same evaluation framework:

| Version | File | Best For |
|---------|------|----------|
| **Human** | `optimization-reviewer-human.md` | Direct use in chat interfaces, readable instructions, includes examples |
| **Agent** | `optimization-reviewer-agent.toon` | Programmatic/agentic use, structured format, token-efficient |

Both versions produce the same output structure and apply the same evaluation dimensions. Choose based on your use case.

---

## The Structured Prompt Format

The agent version uses a structured notation we've found effective for LLM execution. Understanding this format helps you customize the prompts and build your own.

> **Note:** The `.toon` extension is arbitrary—it's plain text readable by any editor. Use any extension you prefer.

### Format Principles

```
BLOCK_NAME {
  key: value
  nested_block: {
    inner_key: inner_value
  }
  list_key: [item1, item2, item3]
}
```

**Core elements:**
- **BLOCK_NAME { }** — Named sections with clear boundaries
- **key: value** — Properties within blocks
- **[ ]** — Arrays/lists for multiple items
- **# comment** — Inline explanation where context prevents ambiguity

### Why This Format?

| Benefit | Explanation |
|---------|-------------|
| **Parseability** | Clear block boundaries make navigation deterministic |
| **Hierarchy** | Nesting expresses relationships without prose |
| **Extensibility** | Add new blocks/keys without restructuring |
| **Token efficiency** | ~40% fewer tokens than equivalent prose |
| **Self-documenting** | Structure conveys meaning; comments add context only where needed |

### When to Add Comments

```
# ✓ Good: explains WHY
trigger: significantly_affects_evaluation  # minor ambiguities can use defaults

# ✗ Unnecessary: restates WHAT  
max: 3  # maximum is 3
```

Add comments when:
- Explaining *why* a constraint exists
- Clarifying terms that could be misinterpreted
- Noting assumptions that might not hold
- Providing context that aids execution decisions

Omit comments for self-evident keys and standard patterns.

---

## Installation

```bash
npm install optimization-reviewer
```

For CLI access globally:
```bash
npm install -g optimization-reviewer
```

Or copy the prompt files directly from this repository.

---

## CLI Usage

The `pre` command (Prompt REview) provides quick access to the reviewer:

### Basic Usage

```bash
# Review a prompt directly
pre "You are a helpful assistant. Answer questions concisely."

# Review from a file
pre -f my-prompt.md

# Pipe content
cat prompt.txt | pre

# Output to file
pre -f input.md -o review.md
```

### Options

| Flag | Description |
|------|-------------|
| `-f, --file <path>` | Read prompt from file |
| `-a, --agent` | Use agent format (default: human) |
| `-r, --raw` | Output raw system prompt only |
| `-o, --output <path>` | Write to file instead of stdout |
| `-q, --quiet` | Suppress instructional wrapper |
| `--api` | Call Claude API directly |
| `--model <model>` | Model for API mode |

### API Mode

Set `ANTHROPIC_API_KEY` to get reviews directly:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pre -f my-prompt.md --api
```

### Quick One-liner via npx

```bash
npx optimization-reviewer "Your prompt here"
```

---

## Programmatic Usage

### Human Version

1. Copy contents of `optimization-reviewer-human.md`
2. Paste into your chat interface (Claude, ChatGPT, etc.)
3. Follow with: "Review this optimization:" and your content

**Example:**
```
[Paste optimization-reviewer-human.md]

Review this optimization:

def calculate_total(items):
    total = 0
    for item in items:
        total = total + item.price
    return total
```

### Agent Version

For programmatic use, import from the package:

```javascript
const { agentPrompt } = require('optimization-reviewer');

// Use with your LLM API
const response = await llm.complete({
  system: agentPrompt,
  user: `Review this optimization:\n\n${yourOptimization}`
});
```

Or with Claude's API:

```javascript
import Anthropic from '@anthropic-ai/sdk';
import { agentPrompt } from 'optimization-reviewer';

const client = new Anthropic();

const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514', // Opus 4.5 recommended for complex reviews
  max_tokens: 4096,
  system: agentPrompt,
  messages: [
    { role: 'user', content: `Review this optimization:\n\n${optimization}` }
  ]
});
```

---

## What Gets Evaluated

### Universal Dimensions (always applied)

| Dimension | Question |
|-----------|----------|
| Intent Alignment | Does this solve the right problem? |
| Completeness | Are all necessary components present? |
| Correctness | Will it work as intended? |
| Clarity | Is the intent unambiguous? |
| Robustness | Does it handle failure gracefully? |
| Efficiency | Is it appropriately resource-conscious? |

### Type-Specific Dimensions (applied based on detected type)

| Type | Additional Dimensions |
|------|----------------------|
| Code | Performance, maintainability, security, testability |
| Prompt | Model optimization, executability, output specification |
| Process | Sequencing, ownership, measurability, iteration |
| Architecture | Scalability, modularity, integration, observability |
| Workflow | Handoffs, parallelization, bottlenecks, automation potential |

**Hybrid optimizations** (e.g., "prompt for code generation") get dimensions from all applicable types.

---

## Output Format

Both versions produce structured output:

```markdown
## Optimization Summary
- Type: [detected type(s)]
- Goal: [what it's trying to achieve]
- Scope: [boundaries]

## Strengths
[What's working well]

## Issues

### [Dimension]
**Issue: [title]**
- Location: [quoted reference]
- Problem: [what's wrong]
- Failure mode: [what breaks]
- Fix: [concrete solution]
- Confidence: [High/Moderate/Low]

## Recommendation
- Verdict: [ready / needs_minor_fixes / needs_significant_work / fundamental_rethink]
- Priority fixes: [top 3]
- Post-fix confidence: [expected quality]
```

---

## Clarifying Questions

The reviewer may ask up to 3 clarifying questions before starting if critical ambiguity exists. Questions follow this structure:

> "I understand [what's clear]. Unclear: [specific ambiguity]. This affects [impact on review]. Options: [A / B / C]"

This maximizes the value of each question by:
- Confirming what's already understood
- Pinpointing the specific gap
- Explaining why it matters
- Offering constrained options when possible

---

## Safety

The reviewer includes a safety screen that declines to review optimizations designed to:
- Exploit vulnerabilities
- Manipulate or deceive users
- Facilitate harm
- Violate ethical guidelines

In these cases, it explains the concern without providing improvement suggestions.

---

## Customization

### Adding Dimensions

To add a new evaluation dimension, edit the relevant section:

**Human version:**
```markdown
**Universal Dimensions (always consider):**
...existing dimensions...
- **Your New Dimension:** What question does it answer?
```

**Agent version:**
```
universal: {
  ...existing dimensions...
  your_new_dimension: [check1, check2, check3]
}
```

### Adding Optimization Types

**Agent version:**
```
heuristics: {
  ...existing types...
  your_type: [keyword1, keyword2, keyword3]
}

type_specific: {
  ...existing types...
  your_type: [dimension1, dimension2, dimension3]
}
```

### Adjusting Thoroughness

The default prioritizes thoroughness. To reduce verbosity:

**Human version:** Add to instructions:
> "Focus on top 5 issues only. Skip minor concerns."

**Agent version:** Modify output structure:
```
issues: {
  max: 5
  filter: severity >= moderate
}
```

---

## Examples

### Reviewing Code

```
Review this optimization:

function deduplicate(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (result.indexOf(arr[i]) === -1) {
      result.push(arr[i]);
    }
  }
  return result;
}
```

### Reviewing a Prompt

```
Review this optimization:

You are a helpful assistant. Answer the user's questions.
Be concise but thorough. If you don't know something, say so.
```

### Reviewing a Process

```
Review this optimization:

Code Review Process:
1. Developer submits PR
2. Reviewer assigned automatically
3. Reviewer provides feedback within 24h
4. Developer addresses feedback
5. Reviewer approves or requests changes
6. PR merged when approved
```

### Reviewing a Hybrid (Prompt + Code)

```
Review this optimization:

Write a Python function that:
- Takes a list of dictionaries with 'name' and 'score' keys
- Returns the top 3 by score
- Handles ties by alphabetical name order
- Include type hints and docstring
```

---

## API Reference

### Input

Any text describing an optimization. The reviewer auto-detects the type.

### Output Structure

```typescript
interface ReviewOutput {
  summary: {
    type: string[];
    goal: string;
    scope: string;
  };
  strengths: Array<{
    item: string;
    rationale: string;
  }>;
  issues: Array<{
    dimension: string;
    location: string;
    problem: string;
    failure_mode: string;
    fix: string;
    confidence: 'high' | 'moderate' | 'low';
    confidence_reasoning: string;
  }>;
  recommendation: {
    verdict: 'ready' | 'needs_minor_fixes' | 'needs_significant_work' | 'fundamental_rethink';
    priority_fixes: string[];
    post_fix_confidence: string;
  };
}
```

---

## Model Compatibility

Optimized for **Claude Opus 4.5** but compatible with other advanced LLMs.

| Model | Compatibility | Notes |
|-------|--------------|-------|
| Claude Opus 4.5 | ✅ Full | Optimized target |
| Claude Sonnet | ✅ Full | Works well |
| GPT-4 | ✅ Good | May need explicit reasoning prompts |
| GPT-3.5 | ⚠️ Partial | May miss nuance; simpler optimizations only |

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Test with both human and agent versions
4. Submit a PR with description of changes

### Development

```bash
git clone https://github.com/ENCROES/optimization-reviewer
cd optimization-reviewer
npm test  # validates prompt structure
```

---

## License

MIT © [ENCROES](https://github.com/ENCROES)

---

## Acknowledgments

Prompt engineering methodology informed by:
- Anthropic's prompt engineering documentation
- Research on structured prompting for LLMs
- Community feedback on agentic prompt patterns
