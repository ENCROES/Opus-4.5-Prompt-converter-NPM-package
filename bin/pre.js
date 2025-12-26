#!/usr/bin/env node

const fs = require('fs');
const { parseArgs } = require('util');

const { humanPrompt, agentPrompt } = require('../index.js');

// Constants - document magic numbers
const DEFAULT_MODEL = 'claude-opus-4-5-20251101';
const MAX_TOKENS = 4096;
const API_VERSION = '2023-06-01';
const STDIN_TIMEOUT_MS = 30000;

const HELP = `
pre - Prompt Review using optimization-reviewer

USAGE:
  pre "<prompt>"              Review a prompt (quoted string)
  pre -f <file>               Review contents of a file
  cat file.txt | pre          Review from stdin
  pre --help                  Show this help

OPTIONS:
  -f, --file <path>           Read prompt from file
  -a, --agent                 Use agent format (default: human)
  -r, --raw                   Output raw system prompt only
  -o, --output <path>         Write to file instead of stdout
  -q, --quiet                 Suppress instructional output
  --api                       Call Claude API (requires ANTHROPIC_API_KEY)
  --model <model>             Model for API mode (default: ${DEFAULT_MODEL})
  --max-tokens <n>            Max tokens for API response (default: ${MAX_TOKENS})

EXAMPLES:
  pre "You are a helpful assistant. Answer questions concisely."
  pre -f my-prompt.md
  pre -f prompt.txt --api
  echo "Review this code" | pre
  pre -r > system-prompt.txt

ENVIRONMENT:
  ANTHROPIC_API_KEY           Required for --api mode

OUTPUT:
  By default, outputs a formatted message ready to paste into Claude.ai.
  With --api, calls the API directly and outputs the review.
`;

function parseCliArgs(argv) {
  const options = {
    help: { type: 'boolean', short: 'h' },
    agent: { type: 'boolean', short: 'a' },
    raw: { type: 'boolean', short: 'r' },
    quiet: { type: 'boolean', short: 'q' },
    api: { type: 'boolean' },
    file: { type: 'string', short: 'f' },
    output: { type: 'string', short: 'o' },
    model: { type: 'string' },
    'max-tokens': { type: 'string' }
  };

  try {
    const { values, positionals } = parseArgs({
      args: argv,
      options,
      allowPositionals: true
    });

    return {
      help: values.help || false,
      agent: values.agent || false,
      raw: values.raw || false,
      quiet: values.quiet || false,
      api: values.api || false,
      file: values.file || null,
      output: values.output || null,
      model: values.model || DEFAULT_MODEL,
      maxTokens: values['max-tokens'] ? parseInt(values['max-tokens'], 10) : MAX_TOKENS,
      positionals
    };
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.error('Use --help for usage information.');
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 && process.stdin.isTTY) {
    console.log(HELP);
    process.exit(0);
  }

  const flags = parseCliArgs(args);

  if (flags.help) {
    console.log(HELP);
    process.exit(0);
  }

  // Validate maxTokens
  if (isNaN(flags.maxTokens) || flags.maxTokens <= 0) {
    console.error('Error: --max-tokens must be a positive integer');
    process.exit(1);
  }

  let prompt = flags.positionals[0] || null;

  // Get prompt from file, argument, or stdin
  if (flags.file) {
    try {
      prompt = fs.readFileSync(flags.file, 'utf8');
    } catch (err) {
      console.error(`Error reading file: ${err.message}`);
      process.exit(1);
    }
  } else if (!prompt && !process.stdin.isTTY) {
    prompt = await readStdin();
  }

  if (!prompt) {
    console.error('Error: No prompt provided. Use --help for usage.');
    process.exit(1);
  }

  const systemPrompt = flags.agent ? agentPrompt : humanPrompt;

  // Raw mode: just output the system prompt
  if (flags.raw) {
    output(systemPrompt, flags.output);
    process.exit(0);
  }

  // API mode: call Claude
  if (flags.api) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('Error: ANTHROPIC_API_KEY environment variable required for --api mode');
      process.exit(1);
    }

    if (!flags.quiet) {
      console.error(`Calling Claude API (model: ${flags.model})...`);
    }

    try {
      const review = await callAPI(apiKey, flags.model, systemPrompt, prompt, flags.maxTokens);
      output(review, flags.output);
    } catch (err) {
      console.error(`API Error: ${err.message}`);
      process.exit(1);
    }
    process.exit(0);
  }

  // Default: format for chat interface
  const formatted = formatForChat(systemPrompt, prompt, flags.quiet);
  output(formatted, flags.output);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    const timeout = setTimeout(() => {
      reject(new Error(`Stdin read timed out after ${STDIN_TIMEOUT_MS}ms`));
    }, STDIN_TIMEOUT_MS);

    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });

    process.stdin.on('end', () => {
      clearTimeout(timeout);
      resolve(data.trim());
    });

    process.stdin.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to read stdin: ${err.message}`));
    });
  });
}

function formatForChat(systemPrompt, userPrompt, quiet) {
  const divider = '─'.repeat(60);

  let out = '';
  if (!quiet) {
    out += `${divider}\n`;
    out += 'PASTE THE FOLLOWING INTO CLAUDE.AI (or similar)\n';
    out += `${divider}\n\n`;
  }

  out += systemPrompt;
  out += '\n\n---\n\n';
  out += 'Review this optimization:\n\n';
  out += userPrompt;

  if (!quiet) {
    out += `\n\n${divider}\n`;
    out += 'END OF PROMPT\n';
    out += `${divider}`;
  }

  return out;
}

async function callAPI(apiKey, model, systemPrompt, userPrompt, maxTokens) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION
    },
    body: JSON.stringify({
      model: model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Review this optimization:\n\n${userPrompt}` }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  const data = await response.json();

  // Validate API response structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid API response: expected JSON object');
  }

  if (!Array.isArray(data.content)) {
    throw new Error('Invalid API response: missing or invalid "content" array');
  }

  if (data.content.length === 0) {
    throw new Error('Invalid API response: empty "content" array');
  }

  const textBlocks = data.content.filter(block => block.type === 'text');
  if (textBlocks.length === 0) {
    throw new Error('Invalid API response: no text blocks in response');
  }

  return textBlocks.map(block => block.text || '').join('\n');
}

function output(content, filePath) {
  if (filePath) {
    try {
      fs.writeFileSync(filePath, content);
    } catch (err) {
      console.error(`Error writing to file: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.log(content);
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
