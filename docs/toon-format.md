# The `.toon` Structured Prompt Format

The agent version uses a structured notation effective for LLM execution.

> **Note:** The `.toon` extension is arbitrary—it's plain text readable by any editor.

## Format Principles

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
- **# comment** — Inline explanation where needed

## Benefits

| Benefit | Explanation |
|---------|-------------|
| **Parseability** | Clear block boundaries make navigation deterministic |
| **Hierarchy** | Nesting expresses relationships without prose |
| **Extensibility** | Add new blocks/keys without restructuring |
| **Token efficiency** | ~40% fewer tokens than equivalent prose |

## When to Add Comments

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
