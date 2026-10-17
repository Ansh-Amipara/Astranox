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

const disallowedPalette = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose'
];

const rawTailwindColorRegex = new RegExp(
  `\\b(?:bg|text|border|ring|from|via|to|outline|fill|stroke|shadow|divide)-(?:${disallowedPalette.join('|')})(?:-[0-9]+)?(?:\\/[0-9]+)?\\b`,
  'g'
);

const hexColorRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;
const rgbHslColorRegex = /\b(?:rgba?|hsla?)\([^)]*\)/;

let totalErrors = 0;
const errorsByFile = {};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const fileErrors = [];

  lines.forEach((line, lineIdx) => {
    // Ignore pure comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // Check for raw Tailwind palette colors
    const rawMatches = line.match(rawTailwindColorRegex);
    if (rawMatches) {
      fileErrors.push({
        line: lineIdx + 1,
        type: 'Raw Tailwind color class',
        matches: Array.from(new Set(rawMatches)),
        snippet: line.trim()
      });
    }

    // Check for arbitrary hex colors
    const hexMatches = line.match(hexColorRegex);
    if (hexMatches) {
      // Exclude sprite/svg path URLs or non-color hashes if any
      const hex = hexMatches[0];
      if (/#[0-9a-fA-F]{3,8}/.test(line) && (line.includes('className') || line.includes('style') || line.includes('bg-[') || line.includes('text-['))) {
        fileErrors.push({
          line: lineIdx + 1,
          type: 'Arbitrary hex color',
          matches: [hex],
          snippet: line.trim()
        });
      }
    }

    // Check for rgb/hsl arbitrary colors
    if ((line.includes('className') || line.includes('style')) && rgbHslColorRegex.test(line)) {
      fileErrors.push({
        line: lineIdx + 1,
        type: 'Arbitrary RGB/HSL color',
        matches: line.match(rgbHslColorRegex),
        snippet: line.trim()
      });
    }

    // Check for direct sonner import outside of lib/toast.ts and main.tsx
    if (line.includes("from 'sonner'") || line.includes('from "sonner"')) {
      const normFile = file.replace(/\\/g, '/');
      if (!normFile.endsWith('src/main.tsx') && !normFile.endsWith('src/lib/toast.ts')) {
        fileErrors.push({
          line: lineIdx + 1,
          type: "Disallowed 'sonner' direct import (use @/lib/toast instead)",
          matches: ["sonner"],
          snippet: line.trim()
        });
      }
    }
  });

  if (fileErrors.length > 0) {
    const relPath = path.relative(path.resolve(__dirname, '..'), file).replace(/\\/g, '/');
    errorsByFile[relPath] = fileErrors;
    totalErrors += fileErrors.length;
  }
}

if (totalErrors > 0) {
  console.error(`\x1b[31m[check:colors] FAILED: Found ${totalErrors} disallowed color violations in ${Object.keys(errorsByFile).length} files.\x1b[0m\n`);
  for (const [f, errs] of Object.entries(errorsByFile)) {
    console.error(`\x1b[33m${f}\x1b[0m:`);
    errs.slice(0, 5).forEach(e => {
      console.error(`  Line ${e.line}: [${e.type}] ${e.matches.join(', ')}`);
      console.error(`    ${e.snippet.substring(0, 100)}`);
    });
    if (errs.length > 5) {
      console.error(`  ... and ${errs.length - 5} more violations in this file.`);
    }
    console.error('');
  }
  process.exit(1);
} else {
  console.log(`\x1b[32m[check:colors] PASSED: All ${files.length} .tsx files comply with the global design system tokens.\x1b[0m`);
  process.exit(0);
}
