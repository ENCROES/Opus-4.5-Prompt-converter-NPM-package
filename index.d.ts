/** Human-readable prompt for chat interfaces */
export const humanPrompt: string;

/** Structured prompt for programmatic/agentic use */
export const agentPrompt: string;

/** Alias for humanPrompt */
export const human: string;

/** Alias for agentPrompt */
export const agent: string;

/**
 * Get the human-readable prompt (lazy-loaded)
 * @returns The human prompt content
 */
export function getHumanPrompt(): string;

/**
 * Get the structured agent prompt (lazy-loaded)
 * @returns The agent prompt content
 */
export function getAgentPrompt(): string;

/** Default export containing all prompts and getter functions */
declare const _default: {
  humanPrompt: string;
  agentPrompt: string;
  human: string;
  agent: string;
  getHumanPrompt: typeof getHumanPrompt;
  getAgentPrompt: typeof getAgentPrompt;
};
export default _default;
