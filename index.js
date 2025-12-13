const fs = require('fs');
const path = require('path');

const humanPrompt = fs.readFileSync(
  path.join(__dirname, 'optimization-reviewer-human.md'),
  'utf8'
);

const agentPrompt = fs.readFileSync(
  path.join(__dirname, 'optimization-reviewer-agent.toon'),
  'utf8'
);

module.exports = {
  humanPrompt,
  agentPrompt,
  human: humanPrompt,
  agent: agentPrompt
};
