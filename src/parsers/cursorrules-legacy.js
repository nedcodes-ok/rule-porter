'use strict';

var fs = require('fs');
var path = require('path');

// Parse legacy .cursorrules file (single flat file, no frontmatter)
// Split on --- delimiter lines (but not YAML frontmatter delimiters)
function discover(dir) {
  var filePath = path.join(dir, '.cursorrules');
  if (!fs.existsSync(filePath)) return null;

  var content;
  try {
    content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  } catch (e) {
    return null;
  }

  if (!content || !content.trim()) return null;

  // Split on standalone --- lines (must be on its own line, not part of frontmatter)
  // Regex: match --- that's either at start or preceded by newline, and followed by newline or end
  var sections = content.split(/\n---\n/);
  
  // Also handle cases where --- is at start/end
  var allSections = [];
  for (var i = 0; i < sections.length; i++) {
    var section = sections[i].trim();
    if (section) {
      allSections.push(section);
    }
  }

  // If no sections found, treat whole file as one rule
  if (allSections.length === 0) {
    allSections = [content.trim()];
  }

  var rules = [];
  for (var j = 0; j < allSections.length; j++) {
    var sectionBody = allSections[j];
    var ruleName = allSections.length > 1 ? 'cursorrules-' + (j + 1) : 'cursorrules';
    var ruleDesc = allSections.length > 1 ? 'Legacy .cursorrules (section ' + (j + 1) + ')' : 'Legacy .cursorrules';
    
    rules.push({
      name: ruleName,
      fileName: '.cursorrules',
      description: ruleDesc,
      globs: '',
      alwaysApply: true,
      body: sectionBody,
      hasFrontmatter: false
    });
  }

  return {
    rules: rules,
    skipped: []
  };
}

module.exports = { discover: discover };
