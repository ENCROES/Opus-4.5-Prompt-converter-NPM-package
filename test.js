const fs = require('fs');
const assert = require('assert');
const { execSync, spawn } = require('child_process');
const path = require('path');

console.log('Running optimization-reviewer test suite...\n');

// Track test results
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`✗ ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

function testAsync(name, fn) {
  return fn()
    .then(() => {
      console.log(`✓ ${name}`);
      passed++;
    })
    .catch((err) => {
      console.log(`✗ ${name}`);
      console.error(`  ${err.message}`);
      failed++;
    });
}

// ============================================
// Module Export Tests
// ============================================
console.log('--- Module Exports ---');

test('exports humanPrompt', () => {
  const pkg = require('./index.js');
  assert(typeof pkg.humanPrompt === 'string', 'humanPrompt should be a string');
  assert(pkg.humanPrompt.length > 1000, 'humanPrompt should have content');
});

test('exports agentPrompt', () => {
  const pkg = require('./index.js');
  assert(typeof pkg.agentPrompt === 'string', 'agentPrompt should be a string');
  assert(pkg.agentPrompt.length > 500, 'agentPrompt should have content');
});

test('human alias equals humanPrompt', () => {
  const pkg = require('./index.js');
  assert(pkg.human === pkg.humanPrompt, 'human should equal humanPrompt');
});

test('agent alias equals agentPrompt', () => {
  const pkg = require('./index.js');
  assert(pkg.agent === pkg.agentPrompt, 'agent should equal agentPrompt');
});

test('prompts match file contents', () => {
  const pkg = require('./index.js');
  const humanFile = fs.readFileSync('optimization-reviewer-human.md', 'utf8');
  const agentFile = fs.readFileSync('optimization-reviewer-agent.toon', 'utf8');
  assert(pkg.humanPrompt === humanFile, 'humanPrompt should match file');
  assert(pkg.agentPrompt === agentFile, 'agentPrompt should match file');
});

// ============================================
// Human Prompt Structure Tests
// ============================================
console.log('\n--- Human Prompt Structure ---');

const human = fs.readFileSync('optimization-reviewer-human.md', 'utf8');

test('has Before You Begin section', () => {
  assert(human.includes('## Before You Begin'), 'Missing: Before You Begin');
});

test('has How to Review section', () => {
  assert(human.includes('## How to Review'), 'Missing: How to Review');
});

test('has Output Format section', () => {
  assert(human.includes('## Output Format'), 'Missing: Output Format');
});

test('has Universal Dimensions', () => {
  assert(human.includes('Universal Dimensions'), 'Missing: Universal Dimensions');
});

test('has Type-Specific Dimensions', () => {
  assert(human.includes('Type-Specific Dimensions'), 'Missing: Type-Specific Dimensions');
});

test('has validation checklist', () => {
  assert(human.includes('Before Delivering'), 'Missing: Before Delivering section');
});

// ============================================
// Agent Prompt Structure Tests
// ============================================
console.log('\n--- Agent Prompt Structure ---');

const agent = fs.readFileSync('optimization-reviewer-agent.toon', 'utf8');

test('has SAFETY_SCREEN block', () => {
  assert(agent.includes('SAFETY_SCREEN'), 'Missing: SAFETY_SCREEN');
});

test('has CLARIFICATION block', () => {
  assert(agent.includes('CLARIFICATION'), 'Missing: CLARIFICATION');
});

test('has TYPE_DETECTION block', () => {
  assert(agent.includes('TYPE_DETECTION'), 'Missing: TYPE_DETECTION');
});

test('has EVALUATION_DIMENSIONS block', () => {
  assert(agent.includes('EVALUATION_DIMENSIONS'), 'Missing: EVALUATION_DIMENSIONS');
});

test('has OUTPUT_STRUCTURE block', () => {
  assert(agent.includes('OUTPUT_STRUCTURE'), 'Missing: OUTPUT_STRUCTURE');
});

test('has VALIDATION block', () => {
  assert(agent.includes('VALIDATION'), 'Missing: VALIDATION');
});

test('has FAILURE_HANDLING block', () => {
  assert(agent.includes('FAILURE_HANDLING'), 'Missing: FAILURE_HANDLING');
});

// ============================================
// CLI Tests
// ============================================
console.log('\n--- CLI Tests ---');

test('CLI script exists', () => {
  assert(fs.existsSync('bin/pre.js'), 'CLI script missing');
});

test('CLI --help shows usage', () => {
  const output = execSync('node bin/pre.js --help', { encoding: 'utf8' });
  assert(output.includes('pre - Prompt Review'), 'Help missing title');
  assert(output.includes('--api'), 'Help missing --api flag');
  assert(output.includes('--model'), 'Help missing --model flag');
  assert(output.includes('--max-tokens'), 'Help missing --max-tokens flag');
});

test('CLI -h is alias for --help', () => {
  const output = execSync('node bin/pre.js -h', { encoding: 'utf8' });
  assert(output.includes('pre - Prompt Review'), 'Short help flag not working');
});

test('CLI accepts positional prompt argument', () => {
  const output = execSync('node bin/pre.js "test prompt" -q', { encoding: 'utf8' });
  assert(output.includes('test prompt'), 'Prompt not included in output');
  assert(output.includes('Optimization Reviewer'), 'System prompt missing');
});

test('CLI --agent flag uses agent prompt', () => {
  const output = execSync('node bin/pre.js "test" -q --agent', { encoding: 'utf8' });
  assert(output.includes('SAFETY_SCREEN') || output.includes('AGENT:'), 'Agent prompt not used');
});

test('CLI --raw outputs only system prompt', () => {
  const output = execSync('node bin/pre.js "UNIQUE_USER_INPUT_12345" --raw', { encoding: 'utf8' });
  assert(!output.includes('UNIQUE_USER_INPUT_12345'), 'User prompt should not be in raw output');
  assert(output.includes('Optimization Reviewer'), 'System prompt missing');
});

test('CLI --file reads from file', () => {
  // Create temp file
  const tempFile = path.join(__dirname, 'test-input.tmp');
  fs.writeFileSync(tempFile, 'file content here');
  try {
    const output = execSync(`node bin/pre.js --file="${tempFile}" -q`, { encoding: 'utf8' });
    assert(output.includes('file content here'), 'File content not included');
  } finally {
    fs.unlinkSync(tempFile);
  }
});

test('CLI --file=value syntax works', () => {
  const tempFile = path.join(__dirname, 'test-input2.tmp');
  fs.writeFileSync(tempFile, 'equals syntax test');
  try {
    const output = execSync(`node bin/pre.js --file=${tempFile} -q`, { encoding: 'utf8' });
    assert(output.includes('equals syntax test'), 'Equals syntax not working');
  } finally {
    fs.unlinkSync(tempFile);
  }
});

test('CLI -f is alias for --file', () => {
  const tempFile = path.join(__dirname, 'test-input3.tmp');
  fs.writeFileSync(tempFile, 'short flag test');
  try {
    const output = execSync(`node bin/pre.js -f "${tempFile}" -q`, { encoding: 'utf8' });
    assert(output.includes('short flag test'), 'Short -f flag not working');
  } finally {
    fs.unlinkSync(tempFile);
  }
});

test('CLI --output writes to file', () => {
  const outputFile = path.join(__dirname, 'test-output.tmp');
  try {
    execSync(`node bin/pre.js "output test" -q --output="${outputFile}"`, { encoding: 'utf8' });
    const content = fs.readFileSync(outputFile, 'utf8');
    assert(content.includes('output test'), 'Output file missing content');
  } finally {
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  }
});

test('CLI fails on missing file', () => {
  try {
    execSync('node bin/pre.js --file=nonexistent.txt 2>&1', { encoding: 'utf8' });
    assert(false, 'Should have thrown');
  } catch (err) {
    assert(err.status !== 0, 'Should exit with error');
  }
});

test('CLI fails on unknown option', () => {
  try {
    execSync('node bin/pre.js --unknown-flag 2>&1', { encoding: 'utf8' });
    assert(false, 'Should have thrown');
  } catch (err) {
    assert(err.status !== 0, 'Should exit with error');
  }
});

test('CLI --api fails without API key', () => {
  try {
    // Unset ANTHROPIC_API_KEY for this test
    const result = execSync('node bin/pre.js "test" --api 2>&1', {
      encoding: 'utf8',
      env: { ...process.env, ANTHROPIC_API_KEY: '' }
    });
    assert(false, 'Should have thrown');
  } catch (err) {
    assert(err.status !== 0, 'Should exit with error');
  }
});

test('CLI --quiet suppresses wrapper', () => {
  const quietOutput = execSync('node bin/pre.js "test" --quiet', { encoding: 'utf8' });
  const normalOutput = execSync('node bin/pre.js "test"', { encoding: 'utf8' });
  assert(!quietOutput.includes('PASTE THE FOLLOWING'), 'Quiet should suppress wrapper');
  assert(normalOutput.includes('PASTE THE FOLLOWING'), 'Normal should have wrapper');
});

test('CLI default model is claude-opus-4-20250514', () => {
  const output = execSync('node bin/pre.js --help', { encoding: 'utf8' });
  assert(output.includes('claude-opus-4-20250514'), 'Default model should be Opus');
});

// ============================================
// TypeScript Definitions Tests
// ============================================
console.log('\n--- TypeScript Definitions ---');

test('index.d.ts exists', () => {
  assert(fs.existsSync('index.d.ts'), 'TypeScript definitions missing');
});

test('index.d.ts exports all members', () => {
  const dts = fs.readFileSync('index.d.ts', 'utf8');
  assert(dts.includes('humanPrompt'), 'Missing humanPrompt export');
  assert(dts.includes('agentPrompt'), 'Missing agentPrompt export');
  assert(dts.includes('human'), 'Missing human export');
  assert(dts.includes('agent'), 'Missing agent export');
});

// ============================================
// Package.json Tests
// ============================================
console.log('\n--- Package Configuration ---');

test('package.json is valid JSON', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert(pkg.name === 'optimization-reviewer', 'Package name mismatch');
});

test('package.json has correct main entry', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert(pkg.main === 'index.js', 'Main entry should be index.js');
});

test('package.json has types entry', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert(pkg.types === 'index.d.ts', 'Types entry should be index.d.ts');
});

test('package.json has bin entry', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert(pkg.bin && pkg.bin.pre, 'Bin entry for pre missing');
});

test('package.json requires Node 18+', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert(pkg.engines && pkg.engines.node, 'Missing engines.node');
  assert(pkg.engines.node.includes('18'), 'Should require Node 18+');
});

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(40));
console.log(`Tests: ${passed} passed, ${failed} failed`);
console.log('='.repeat(40));

if (failed > 0) {
  process.exit(1);
}
