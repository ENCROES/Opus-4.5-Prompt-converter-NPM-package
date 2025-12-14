# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ESM support with dual CJS/ESM exports
- `getHumanPrompt()` and `getAgentPrompt()` lazy-loading functions
- `--max-tokens` CLI flag for configurable API response length
- GitHub Actions CI workflow (Node 18, 20, 22)
- ESLint configuration
- Comprehensive test suite (40 tests)

### Changed
- Agent prompt converted from custom `.toon` format to standard Markdown
- Default model changed to `claude-opus-4-5-20251101` (was `claude-sonnet-4-20250514`)
- CLI now uses Node.js built-in `parseArgs` instead of hand-rolled parser
- Prompts are now lazy-loaded on first access instead of at require time

### Fixed
- API response validation to prevent silent failures on malformed responses
- Stdin reading now has proper error handling and timeout
- CLI now supports `--flag=value` syntax in addition to `--flag value`

## [1.0.0] - 2024-12-15

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
