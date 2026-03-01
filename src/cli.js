#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var parser = require('./parser');

var VERSION = require('../package.json').version;

// Colors
var CYAN = '\x1b[36m';
var GREEN = '\x1b[32m';
var YELLOW = '\x1b[33m';
var RED = '\x1b[31m';
var BOLD = '\x1b[1m';
var DIM = '\x1b[2m';
var RESET = '\x1b[0m';

var FORMATS = {
  'cursor': { label: 'Cursor .mdc', module: './formats/cursor' },
  'cursorrules-legacy': { label: '.cursorrules (legacy)', module: './formats/cursorrules-legacy' },
  'agents-md': { label: 'AGENTS.md', module: './formats/agents-md' },
  'claude-md': { label: 'CLAUDE.md', module: './formats/claude-md' },
  'copilot': { label: 'Copilot Instructions', module: './formats/copilot' },
  'windsurf': { label: 'Windsurf Rules', module: './formats/windsurf' }
};

var SOURCES = {
  'cursor': { label: '.cursor/rules/*.mdc', module: null },
  'cursorrules-legacy': { label: '.cursorrules', module: './parsers/cursorrules-legacy' },
  'agents-md': { label: 'AGENTS.md', module: './parsers/agents-md' },
  'claude-md': { label: 'CLAUDE.md', module: './parsers/claude-md' },
  'copilot': { label: 'Copilot Instructions', module: './parsers/copilot' },
  'windsurf': { label: '.windsurfrules', module: './parsers/windsurf' }
};

function showHelp() {
  var lines = [
    '',
    CYAN + BOLD + 'rule-porter' + RESET + ' v' + VERSION + ' — Convert AI IDE rules between formats.',
    '',
    YELLOW + 'Usage:' + RESET,
    '  npx rule-porter --to <format>              # Auto-detect source',
    '  npx rule-porter --from cursor --to agents-md',
    '  npx rule-porter --from agents-md --to cursor',
    '',
    YELLOW + 'Source Formats:' + RESET,
    '  cursor              .cursor/rules/*.mdc',
    '  cursorrules-legacy  .cursorrules (legacy single file)',
    '  agents-md           AGENTS.md',
    '  claude-md           CLAUDE.md',
    '  copilot             .github/copilot-instructions.md',
    '  windsurf            .windsurfrules',
    '',
    YELLOW + 'Target Formats:' + RESET,
    '  cursor              .cursor/rules/*.mdc (one file per rule)',
    '  cursorrules-legacy  .cursorrules (legacy single file)',
    '  agents-md           AGENTS.md',
    '  claude-md           CLAUDE.md',
    '  copilot             .github/copilot-instructions.md',
    '  windsurf            .windsurfrules',
    '',
    YELLOW + 'Options:' + RESET,
    '  --from <fmt>    Source format (default: auto-detect)',
    '  --to <fmt>      Target format (required)',
    '  --out <path>    Output path (default: target default location)',
    '  --dry-run       Preview output without writing files',
    '  --help          Show this help',
    '  --version       Show version',
    '',
    DIM + 'https://github.com/nedcodes-ok/rule-porter' + RESET,
    '',
  ];
  console.log(lines.join('\n'));
}

function parseArgs(argv) {
  var args = { from: null, to: null, out: null, dryRun: false, help: false, version: false };
  for (var i = 2; i < argv.length; i++) {
    var arg = argv[i];
    if (arg === '--from' && argv[i + 1]) { args.from = argv[++i]; }
    else if (arg === '--to' && argv[i + 1]) { args.to = argv[++i]; }
    else if (arg === '--out' && argv[i + 1]) { args.out = argv[++i]; }
    else if (arg === '--dry-run') { args.dryRun = true; }
    else if (arg === '--help' || arg === '-h') { args.help = true; }
    else if (arg === '--version' || arg === '-v') { args.version = true; }
  }
  return args;
}

function discoverRules(sourceType, cwd) {
  if (sourceType === 'cursor') {
    return parser.discoverCursorRules(cwd);
  }
  var sourceConfig = SOURCES[sourceType];
  if (!sourceConfig || !sourceConfig.module) return null;
  var sourceParser = require(sourceConfig.module);
  return sourceParser.discover(cwd);
}

function main() {
  var args = parseArgs(process.argv);

  if (args.version) {
    console.log(VERSION);
    process.exit(0);
  }

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.to) {
    console.log();
    console.log(RED + 'Error: --to is required.' + RESET + ' Specify a target format.');
    showHelp();
    process.exit(1);
  }

  if (!FORMATS[args.to]) {
    console.log();
    console.log(RED + 'Error: Unknown target format "' + args.to + '".' + RESET);
    console.log('Available: ' + Object.keys(FORMATS).join(', '));
    process.exit(1);
  }

  var cwd = process.cwd();

  // Detect or validate source
  var sourceType = args.from;
  if (!sourceType) {
    sourceType = parser.detectSource(cwd);
    if (!sourceType) {
      console.log();
      console.log(RED + 'Error: No AI IDE rules found in this directory.' + RESET);
      console.log('Looked for: .cursor/rules/*.mdc, .cursorrules, .windsurfrules, AGENTS.md, CLAUDE.md, .github/copilot-instructions.md');
      console.log('Run this from your project root, or use --from to specify the source format.');
      process.exit(1);
    }
  }

  // Validate source format
  if (!SOURCES[sourceType]) {
    console.log();
    console.log(RED + 'Error: Unknown source format "' + sourceType + '".' + RESET);
    console.log('Available: ' + Object.keys(SOURCES).join(', '));
    process.exit(1);
  }

  // Don't convert to same format
  if (sourceType === args.to) {
    console.log();
    console.log(RED + 'Error: Source and target are the same format.' + RESET);
    process.exit(1);
  }

  // Parse rules
  var discovered = discoverRules(sourceType, cwd);
  if (!discovered || (!discovered.rules.length && !discovered.skipped.length)) {
    console.log();
    console.log(RED + 'Error: No rules found for source "' + sourceType + '".' + RESET);
    process.exit(1);
  }

  var rules = discovered.rules;
  var skipped = discovered.skipped;

  if (rules.length === 0) {
    console.log();
    console.log(RED + 'Error: Found files but none had usable content.' + RESET);
    for (var s = 0; s < skipped.length; s++) {
      console.log('  ' + DIM + skipped[s].file + ': ' + skipped[s].reason + RESET);
    }
    process.exit(1);
  }

  // Convert
  var format = require(FORMATS[args.to].module);
  var result = format.convert(rules);

  var sourceLabel = SOURCES[sourceType].label;
  var targetLabel = FORMATS[args.to].label;

  console.log();
  console.log(CYAN + BOLD + '  rule-porter' + RESET + ' v' + VERSION);
  console.log();
  console.log('  ' + BOLD + 'Source:' + RESET + '  ' + sourceLabel + ' (' + rules.length + ' rule' + (rules.length === 1 ? '' : 's') + ')');
  console.log('  ' + BOLD + 'Target:' + RESET + '  ' + targetLabel);
  console.log();

  // Show rules summary
  var globalCount = rules.filter(function(r) { return r.alwaysApply; }).length;
  var conditionalCount = rules.length - globalCount;
  var noFrontmatterCount = rules.filter(function(r) { return !r.hasFrontmatter; }).length;
  console.log('  ' + GREEN + '✓ ' + globalCount + ' global' + RESET + '  ' + CYAN + conditionalCount + ' conditional' + RESET);
  if (noFrontmatterCount > 0) {
    console.log('  ' + DIM + noFrontmatterCount + ' without frontmatter (treated as conditional)' + RESET);
  }

  // Show skipped files
  if (skipped.length > 0) {
    console.log('  ' + DIM + skipped.length + ' skipped (' + skipped.map(function(s) { return s.file; }).join(', ') + ')' + RESET);
  }
  console.log();

  // Show warnings
  if (result.warnings.length > 0) {
    console.log('  ' + YELLOW + BOLD + 'Warnings:' + RESET);
    for (var i = 0; i < result.warnings.length; i++) {
      var w = result.warnings[i];
      console.log('  ' + YELLOW + '⚠' + RESET + '  ' + DIM + w.rule + ':' + RESET + ' ' + w.message);
    }
    console.log();
  }

  // Handle multi-file output (cursor format)
  if (result.multiFile) {
    if (args.dryRun) {
      console.log('  ' + DIM + '--- dry run preview ---' + RESET);
      console.log();
      for (var f = 0; f < result.files.length; f++) {
        console.log('  ' + BOLD + '=== ' + result.files[f].name + ' ===' + RESET);
        console.log(result.files[f].content);
      }
      console.log('  ' + DIM + '--- end preview ---' + RESET);
      console.log();
      console.log('  ' + YELLOW + 'Dry run — no files written.' + RESET);
    } else {
      var outDir = args.out || path.join(cwd, '.cursor', 'rules');
      try {
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        for (var mf = 0; mf < result.files.length; mf++) {
          var filePath = path.join(outDir, result.files[mf].name);
          fs.writeFileSync(filePath, result.files[mf].content, 'utf8');
          console.log('  ' + GREEN + '✓' + RESET + ' Written ' + BOLD + path.relative(cwd, filePath) + RESET);
        }
      } catch (e) {
        if (e.code === 'EACCES') {
          console.log();
          console.log(RED + 'Error: Cannot write to ' + outDir + ': Permission denied' + RESET);
          process.exit(1);
        }
        throw e; // Re-throw other errors
      }
    }
  } else {
    var outPath = args.out || path.join(cwd, result.filename);

    if (args.dryRun) {
      console.log('  ' + DIM + '--- dry run preview ---' + RESET);
      console.log();
      console.log(result.content);
      console.log('  ' + DIM + '--- end preview ---' + RESET);
      console.log();
      console.log('  ' + YELLOW + 'Dry run — no files written.' + RESET);
    } else {
      var singleOutDir = path.dirname(outPath);
      try {
        if (!fs.existsSync(singleOutDir)) {
          fs.mkdirSync(singleOutDir, { recursive: true });
        }
        fs.writeFileSync(outPath, result.content, 'utf8');
        console.log('  ' + GREEN + '✓' + RESET + ' Written to ' + BOLD + path.relative(cwd, outPath) + RESET);
      } catch (e) {
        if (e.code === 'EACCES') {
          console.log();
          console.log(RED + 'Error: Cannot write to ' + outPath + ': Permission denied' + RESET);
          process.exit(1);
        }
        throw e; // Re-throw other errors
      }
    }
  }

  // Final summary
  var totalFiles = result.multiFile ? result.files.length : 1;
  var summaryParts = [rules.length + ' rule' + (rules.length === 1 ? '' : 's') + ' converted'];
  if (result.multiFile) summaryParts.push(totalFiles + ' file' + (totalFiles === 1 ? '' : 's') + ' generated');
  if (result.warnings.length > 0) summaryParts.push(result.warnings.length + ' warning' + (result.warnings.length === 1 ? '' : 's'));
  if (skipped.length > 0) summaryParts.push(skipped.length + ' skipped');
  console.log();
  console.log('  ' + DIM + summaryParts.join(' · ') + RESET);
  console.log();
  console.log('  ' + DIM + 'Want to check if your rules are healthy?' + RESET + ' npx cursor-doctor scan');
  console.log();
}

main();
