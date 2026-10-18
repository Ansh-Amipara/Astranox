import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function getSourceFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getSourceFiles(fullPath));
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.endsWith('.test.tsx') && !file.endsWith('.test.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getSourceFiles(srcDir);

// Disallowed patterns:
// 1. Raw 100vh (causes mobile browser bar clipping/jumps; use 100dvh/100svh)
const raw100vhRegex = /\b100vh\b/;

// 2. Unbounded w-screen class (causes horizontal scrollbar overflow; use w-full or max-w-screen-*)
// Match "w-screen" preceded by whitespace or quote, and followed by whitespace or quote (not followed by -sm/-md/etc)
const wScreenRegex = /(?:["'\s`]|^)w-screen(?:["'\s`]|$)/;

// 3. Native number inputs (<input ... type="number" ...>)
const inputTypeNumberRegex = /<input[^>]*type=["']number["']|<input[^>]*type=\{["']number["']\}/;

let totalErrors = 0;
const errorsByFile = {};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const fileErrors = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    if (raw100vhRegex.test(line)) {
      fileErrors.push({
        line: lineIdx + 1,
        match: '100vh',
        rule: 'Raw "100vh" detected. Use "100dvh" or "100svh" to avoid mobile navigation bar jump.',
      });
    }

    if (wScreenRegex.test(line)) {
      fileErrors.push({
        line: lineIdx + 1,
        match: 'w-screen',
        rule: 'Raw "w-screen" detected. Use "w-full" or "max-w-*" to avoid horizontal overflow from scrollbars.',
      });
    }

    if (inputTypeNumberRegex.test(line)) {
      fileErrors.push({
        line: lineIdx + 1,
        match: 'type="number"',
        rule: 'Native "<input type=\\"number\\">" detected. Use type="text" with numeric sanitization to avoid unwanted browser spinners and mobile layout breakage.',
      });
    }
  });

  if (fileErrors.length > 0) {
    errorsByFile[file] = fileErrors;
    totalErrors += fileErrors.length;
  }
}

if (totalErrors > 0) {
  console.error('\n❌ Responsive & Layout Guardrail Violations Found:');
  console.error(`Total violations: ${totalErrors} in ${Object.keys(errorsByFile).length} files.\n`);

  for (const [file, errors] of Object.entries(errorsByFile)) {
    const relPath = path.relative(path.resolve(__dirname, '..'), file);
    console.error(`  📄 ${relPath}:`);
    errors.forEach((err) => {
      console.error(`    Line ${err.line}: [${err.match}] - ${err.rule}`);
    });
  }
  console.error('\nPlease fix these violations according to the mobile-first architecture rules in AGENTS.md.\n');
  process.exit(1);
} else {
  console.log('✅ Responsive & Layout Guardrail Check Passed: 0 violations found across all source files.');
  process.exit(0);
}
