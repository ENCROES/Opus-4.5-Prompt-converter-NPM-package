const fs = require('fs');
const assert = require('assert');
const { execSync } = require('child_process');

console.log('Validating optimization-reviewer prompts...\n');

// Verify files exist and load
const human = fs.readFileSync('optimization-reviewer-human.md', 'utf8');
const agent = fs.readFileSync('optimization-reviewer-agent.toon', 'utf8');

// Validate human prompt structure
assert(human.length > 1000, 'Human prompt unexpectedly short');
assert(human.includes('## Before You Begin'), 'Missing: Before You Begin section');
assert(human.includes('## How to Review'), 'Missing: How to Review section');
assert(human.includes('## Output Format'), 'Missing: Output Format section');
assert(human.includes('Universal Dimensions'), 'Missing: Universal Dimensions');
assert(human.includes('Type-Specific Dimensions'), 'Missing: Type-Specific Dimensions');
console.log('✓ Human prompt structure valid');

// Validate agent prompt structure
assert(agent.length > 500, 'Agent prompt unexpectedly short');
assert(agent.includes('SAFETY_SCREEN'), 'Missing: SAFETY_SCREEN block');
assert(agent.includes('CLARIFICATION'), 'Missing: CLARIFICATION block');
assert(agent.includes('TYPE_DETECTION'), 'Missing: TYPE_DETECTION block');
assert(agent.includes('EVALUATION_DIMENSIONS'), 'Missing: EVALUATION_DIMENSIONS block');
assert(agent.includes('OUTPUT_STRUCTURE'), 'Missing: OUTPUT_STRUCTURE block');
assert(agent.includes('VALIDATION'), 'Missing: VALIDATION block');
console.log('✓ Agent prompt structure valid');

// Validate module exports
const pkg = require('./index.js');
assert(pkg.humanPrompt === human, 'humanPrompt export mismatch');
assert(pkg.agentPrompt === agent, 'agentPrompt export mismatch');
assert(pkg.human === human, 'human alias mismatch');
assert(pkg.agent === agent, 'agent alias mismatch');
console.log('✓ Module exports valid');

// Validate CLI exists and runs
assert(fs.existsSync('bin/pre.js'), 'CLI script missing');
const helpOutput = execSync('node bin/pre.js --help', { encoding: 'utf8' });
assert(helpOutput.includes('pre - Prompt Review'), 'CLI help missing title');
assert(helpOutput.includes('--api'), 'CLI help missing --api flag');
console.log('✓ CLI valid');

console.log('\n✓ All validations passed');
