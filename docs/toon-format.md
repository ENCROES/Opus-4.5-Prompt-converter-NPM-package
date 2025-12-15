# TOON Format

TOON (Token-Oriented Object Notation) is a compact, human-readable encoding of the JSON data model optimized for LLM input.

**Full spec:** [github.com/toon-format/spec](https://github.com/toon-format/spec)

## Key Features

- **Indentation-based nesting** (like YAML, no braces)
- **Tabular arrays** with CSV-style rows for uniform data
- **Explicit array lengths** help LLMs parse reliably
- **~40% fewer tokens** than equivalent JSON

## Basic Syntax

```toon
key: value
nested:
  child: data
  another: value
```

## Arrays

**Primitive arrays** (inline):
```toon
tags[3]: red,blue,green
```

**Tabular arrays** (uniform objects):
```toon
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

## Example

```toon
config:
  name: my-app
  version: 1.0.0
  features[3]: auth,logging,cache
  endpoints[2]{path,method,handler}:
    /users,GET,listUsers
    /users,POST,createUser
```

Equivalent JSON:
```json
{
  "config": {
    "name": "my-app",
    "version": "1.0.0",
    "features": ["auth", "logging", "cache"],
    "endpoints": [
      {"path": "/users", "method": "GET", "handler": "listUsers"},
      {"path": "/users", "method": "POST", "handler": "createUser"}
    ]
  }
}
```

## Why TOON for Prompts?

1. **Token efficiency** - Less input = lower cost, more room for context
2. **Structured but readable** - LLMs parse it reliably, humans can edit it
3. **Self-documenting** - Field names in headers, explicit lengths
