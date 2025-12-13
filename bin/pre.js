#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { humanPrompt, agentPrompt } = require('../index.js');

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
  --model <model>             Model for API mode (default: claude-sonnet-4-20250514)

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

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 && process.stdin.isTTY) {
    console.log(HELP);
    process.exit(0);
  }

  // Parse flags
  const flags = {
    agent: false,
    raw: false,
    quiet: false,
    api: false,
    file: null,
    output: null,
    model: 'claude-sonnet-4-20250514'
  };
  
  let prompt = null;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        console.log(HELP);
        process.exit(0);
      case '-a':
      case '--agent':
        flags.agent = true;
        break;
      case '-r':
      case '--raw':
        flags.raw = true;
        break;
      case '-q':
      case '--quiet':
        flags.quiet = true;
        break;
      case '--api':
        flags.api = true;
        break;
      case '-f':
      case '--file':
        flags.file = args[++i];
        break;
      case '-o':
      case '--output':
        flags.output = args[++i];
        break;
      case '--model':
        flags.model = args[++i];
        break;
      default:
        if (!arg.startsWith('-')) {
          prompt = arg;
        } else {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

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
      console.error('Calling Claude API...');
    }
    
    try {
      const review = await callAPI(apiKey, flags.model, systemPrompt, prompt);
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
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

function formatForChat(systemPrompt, userPrompt, quiet) {
  const divider = '─'.repeat(60);
  
  let out = '';
  if (!quiet) {
    out += `${divider}\n`;
    out += `PASTE THE FOLLOWING INTO CLAUDE.AI (or similar)\n`;
    out += `${divider}\n\n`;
  }
  
  out += systemPrompt;
  out += '\n\n---\n\n';
  out += 'Review this optimization:\n\n';
  out += userPrompt;
  
  if (!quiet) {
    out += `\n\n${divider}\n`;
    out += `END OF PROMPT\n`;
    out += `${divider}`;
  }
  
  return out;
}

async function callAPI(apiKey, model, systemPrompt, userPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Review this optimization:\n\n${userPrompt}` }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.content.map(block => block.text || '').join('\n');
}

function output(content, filePath) {
  if (filePath) {
    fs.writeFileSync(filePath, content);
  } else {
    console.log(content);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
