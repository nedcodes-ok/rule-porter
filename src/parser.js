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
    else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      // Parse JSON array
      try {
        data[key] = JSON.parse(rawVal);
      } catch (e) {
        data[key] = rawVal; // fallback to string if parse fails
      }
    }
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
// Also check for .mdc files in the root of the provided path as fallback
function discoverCursorRules(dir) {
  var rulesDir = path.join(dir, '.cursor', 'rules');
  var searchDir = rulesDir;
  
  // If .cursor/rules/ doesn't exist, check if dir itself contains .mdc files
  if (!fs.existsSync(rulesDir)) {
    if (fs.existsSync(dir)) {
      var rootFiles = fs.readdirSync(dir).filter(function(f) {
        return f.endsWith('.mdc');
      });
      if (rootFiles.length > 0) {
        searchDir = dir;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  var files = fs.readdirSync(searchDir).filter(function(f) {
    return f.endsWith('.mdc');
  }).sort();

  if (files.length === 0) return null;

  var rules = [];
  var skipped = [];
  for (var i = 0; i < files.length; i++) {
    var filePath = path.join(searchDir, files[i]);
    var content;
    try {
      content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    } catch (e) {
      skipped.push({ file: files[i], reason: 'unreadable' });
      continue;
    }

    // Skip empty files
    if (!content || !content.trim()) {
      skipped.push({ file: files[i], reason: 'empty' });
      continue;
    }

    var fm = parseFrontmatter(content);
    var body = getBody(content);
    var name = path.basename(files[i], '.mdc');

    // Skip files with no usable content (only frontmatter, no body)
    if (!body && fm.found) {
      skipped.push({ file: files[i], reason: 'no-body' });
      continue;
    }

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

  return { rules: rules, skipped: skipped };
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

  // Check for Windsurf rules
  if (fs.existsSync(path.join(dir, '.windsurfrules'))) return 'windsurf';

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
