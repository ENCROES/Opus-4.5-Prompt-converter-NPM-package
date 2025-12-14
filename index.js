const fs = require('fs');
const path = require('path');

// Lazy-loaded prompt cache to avoid blocking I/O at require() time
let _humanPrompt = null;
let _agentPrompt = null;

function loadHumanPrompt() {
  if (_humanPrompt === null) {
    _humanPrompt = fs.readFileSync(
      path.join(__dirname, 'optimization-reviewer-human.md'),
      'utf8'
    );
  }
  return _humanPrompt;
}

function loadAgentPrompt() {
  if (_agentPrompt === null) {
    _agentPrompt = fs.readFileSync(
      path.join(__dirname, 'optimization-reviewer-agent.toon'),
      'utf8'
    );
  }
  return _agentPrompt;
}

// Use getters to defer file I/O until first access
Object.defineProperties(module.exports, {
  humanPrompt: {
    get: loadHumanPrompt,
    enumerable: true
  },
  agentPrompt: {
    get: loadAgentPrompt,
    enumerable: true
  },
  human: {
    get: loadHumanPrompt,
    enumerable: true
  },
  agent: {
    get: loadAgentPrompt,
    enumerable: true
  }
});
