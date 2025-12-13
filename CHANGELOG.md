# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-XX-XX

### Added
- Initial npm release
- `pre` CLI command for quick prompt reviews
  - Direct string input: `pre "prompt"`
  - File input: `pre -f file.md`
  - Stdin support: `cat file | pre`
  - API mode with `--api` flag (requires ANTHROPIC_API_KEY)
- Human-readable prompt (`optimization-reviewer-human.md`) for chat interfaces
- Agent-optimized prompt (`optimization-reviewer-agent.toon`) for programmatic use
- TypeScript definitions
- Support for optimization types: code, prompt, process, architecture, workflow
- Hybrid optimization detection (e.g., prompts that generate code)
- Universal evaluation dimensions: intent alignment, completeness, correctness, clarity, robustness, efficiency
- Type-specific evaluation dimensions for each optimization type
- Structured output format with actionable fixes
- Safety screening for harmful content
- Clarifying questions protocol (max 3)
- Pre-delivery validation checklist
