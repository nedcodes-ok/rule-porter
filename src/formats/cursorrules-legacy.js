'use strict';

// Convert parsed rules to legacy .cursorrules format
// Concatenate all rule bodies into a single file, separated by blank lines
// This is a lossy conversion (metadata like globs and alwaysApply is lost)

function convert(rules) {
  var sections = [];
  var warnings = [];

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    
    if (rule.body) {
      sections.push(rule.body.trim());
    }

    // Warn about metadata loss
    if (rule.globs || rule.description) {
      warnings.push({
        rule: rule.name,
        message: 'Metadata lost in .cursorrules format (globs, description). This is a flat text format.'
      });
    }
  }

  var content = sections.join('\n\n---\n\n') + '\n';

  return {
    content: content,
    filename: '.cursorrules',
    warnings: warnings
  };
}

module.exports = { convert: convert };
