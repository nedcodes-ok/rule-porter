'use strict';

var fs = require('fs');
var path = require('path');

// Parse legacy .cursorrules file (single flat file, no frontmatter)
function discover(dir) {
  var filePath = path.join(dir, '.cursorrules');
  if (!fs.existsSync(filePath)) return null;

  var content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }

  if (!content || !content.trim()) return null;

  return {
    rules: [{
      name: 'cursorrules',
      fileName: '.cursorrules',
      description: 'Legacy .cursorrules',
      globs: '',
      alwaysApply: true,
      body: content.trim(),
      hasFrontmatter: false
    }],
    skipped: []
  };
}

module.exports = { discover: discover };
