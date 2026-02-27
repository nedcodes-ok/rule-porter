'use strict';

var fs = require('fs');
var path = require('path');

// Parse YAML-like frontmatter from .mdc content
function parseFrontmatter(content) {
  var match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { found: false, data: null };

  var data = {};
  var lines = match[1].split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    var key = line.slice(0, colonIdx).trim();
    var rawVal = line.slice(colonIdx + 1).trim();
    if (rawVal === 'true') data[key] = true;
    else if (rawVal === 'false') data[key] = false;
    else if (rawVal.startsWith('"') && rawVal.endsWith('"')) data[key] = rawVal.slice(1, -1);
    else data[key] = rawVal;
  }
  return { found: true, data: data };
}

// Get body content after frontmatter
function getBody(content) {
  var match = content.match(/^---\n[\s\S]*?\n---\n?/);
  if (!match) return content.trim();
  return content.slice(match[0].length).trim();
}

// Discover .cursor/rules/ directory and parse all .mdc files
function discoverCursorRules(dir) {
  var rulesDir = path.join(dir, '.cursor', 'rules');
  if (!fs.existsSync(rulesDir)) return null;

  var files = fs.readdirSync(rulesDir).filter(function(f) {
    return f.endsWith('.mdc');
  }).sort();

  if (files.length === 0) return null;

  var rules = [];
  for (var i = 0; i < files.length; i++) {
    var filePath = path.join(rulesDir, files[i]);
    var content = fs.readFileSync(filePath, 'utf8');
    var fm = parseFrontmatter(content);
    var body = getBody(content);
    var name = path.basename(files[i], '.mdc');

    rules.push({
      name: name,
      fileName: files[i],
      description: (fm.found && fm.data && fm.data.description) || '',
      globs: (fm.found && fm.data && fm.data.globs) || '',
      alwaysApply: (fm.found && fm.data && fm.data.alwaysApply === true),
      body: body,
      hasFrontmatter: fm.found
    });
  }

  return rules;
}

// Detect what source format exists in a directory
function detectSource(dir) {
  // Check for Cursor rules
  var cursorRulesDir = path.join(dir, '.cursor', 'rules');
  if (fs.existsSync(cursorRulesDir)) {
    var mdcFiles = fs.readdirSync(cursorRulesDir).filter(function(f) { return f.endsWith('.mdc'); });
    if (mdcFiles.length > 0) return 'cursor';
  }

  // Check for legacy .cursorrules
  if (fs.existsSync(path.join(dir, '.cursorrules'))) return 'cursorrules-legacy';

  // Check for AGENTS.md
  if (fs.existsSync(path.join(dir, 'AGENTS.md'))) return 'agents-md';

  // Check for CLAUDE.md
  if (fs.existsSync(path.join(dir, 'CLAUDE.md'))) return 'claude-md';

  // Check for Copilot instructions
  if (fs.existsSync(path.join(dir, '.github', 'copilot-instructions.md'))) return 'copilot';

  return null;
}

module.exports = {
  parseFrontmatter: parseFrontmatter,
  getBody: getBody,
  discoverCursorRules: discoverCursorRules,
  detectSource: detectSource
};
