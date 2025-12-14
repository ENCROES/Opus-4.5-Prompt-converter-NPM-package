import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy-loaded prompt cache
let _humanPrompt = null;
let _agentPrompt = null;

/**
 * Get the human-readable prompt (lazy-loaded)
 * @returns {string} The human prompt content
 */
export function getHumanPrompt() {
  if (_humanPrompt === null) {
    _humanPrompt = readFileSync(
      join(__dirname, 'optimization-reviewer-human.md'),
      'utf8'
    );
  }
  return _humanPrompt;
}

/**
 * Get the structured agent prompt (lazy-loaded)
 * @returns {string} The agent prompt content
 */
export function getAgentPrompt() {
  if (_agentPrompt === null) {
    _agentPrompt = readFileSync(
      join(__dirname, 'optimization-reviewer-agent.md'),
      'utf8'
    );
  }
  return _agentPrompt;
}

// Direct exports for convenience (loads on first access)
// Note: ESM doesn't support getters on exports, so these load immediately on access
export const humanPrompt = getHumanPrompt();
export const agentPrompt = getAgentPrompt();

// Aliases
export const human = humanPrompt;
export const agent = agentPrompt;

// Default export for convenience
export default {
  humanPrompt,
  agentPrompt,
  human,
  agent,
  getHumanPrompt,
  getAgentPrompt
};
