'use strict';

var fs = require('fs');
var path = require('path');

// Parse .windsurfrules file (single flat file at project root, like .cursorrules)
function discover(dir) {
  var filePath = path.join(dir, '.windsurfrules');
  if (!fs.existsSync(filePath)) return null;

  var content;
  try {
    content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  } catch (e) {
    return null;
  }

  if (!content || !content.trim()) return null;

  return {
    rules: [{
      name: 'windsurfrules',
      fileName: '.windsurfrules',
      description: 'Windsurf Rules',
      globs: '',
      alwaysApply: true,
      body: content.trim(),
      hasFrontmatter: false
    }],
    skipped: []
  };
}

module.exports = { discover: discover };
