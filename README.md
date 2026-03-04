# rule-porter

![Cursor Rules](https://img.shields.io/badge/Cursor%20Rules-validated-brightgreen)


[![npm version](https://img.shields.io/npm/v/rule-porter)](https://www.npmjs.com/package/rule-porter) [![npm downloads](https://img.shields.io/npm/dw/rule-porter)](https://www.npmjs.com/package/rule-porter) [![license](https://img.shields.io/npm/l/rule-porter)](https://github.com/nedcodes-ok/rule-porter/blob/main/LICENSE)

**Switch AI editors without rewriting all your rules.**

Convert Cursor rules to Claude Code, GitHub Copilot, Windsurf, or AGENTS.md. And back. Bidirectional. Zero dependencies.

```bash
npx rule-porter --to agents-md
```

## The problem

Your rules are locked into one tool's format. Cursor uses `.mdc` files with YAML frontmatter and glob patterns. Claude Code uses `CLAUDE.md`. Copilot uses `.github/copilot-instructions.md`. None of them understand each other.

## What you get

```
$ npx rule-porter --to agents-md

Converting 12 Cursor rules → AGENTS.md

  ✓ 9 rules converted cleanly
  ⚠ 3 rules had glob patterns (preserved as comments)

Written: AGENTS.md
```

Converting back works too:

```bash
npx rule-porter --from agents-md --to cursor
# → 12 individual .mdc files with frontmatter and globs restored
```

## Supported formats

| Format | Read | Write | File |
|--------|------|-------|------|
| Cursor | ✅ | ✅ | `.cursor/rules/*.mdc` |
| Cursor (legacy) | ✅ | — | `.cursorrules` |
| AGENTS.md | ✅ | ✅ | `AGENTS.md` |
| Claude Code | ✅ | ✅ | `CLAUDE.md` |
| GitHub Copilot | ✅ | ✅ | `.github/copilot-instructions.md` |
| Windsurf | ✅ | ✅ | `.windsurfrules` |

## Common conversions

```bash
# Cursor → other formats
npx rule-porter --to agents-md
npx rule-porter --to claude-md
npx rule-porter --to copilot
npx rule-porter --to windsurf

# Other formats → Cursor
npx rule-porter --from agents-md --to cursor
npx rule-porter --from claude-md --to cursor

# Between any two formats
npx rule-porter --from agents-md --to claude-md

# Migrate legacy .cursorrules to .mdc
npx rule-porter --from cursorrules-legacy --to cursor

# Preview without writing
npx rule-porter --to agents-md --dry-run
```

## What converts cleanly

- Rule names, descriptions, and body content
- Global vs conditional rule separation
- `alwaysApply` rules become top-level sections
- Globs are restored when converting back to Cursor

## What gets flagged

- **Glob patterns** become comments in flat formats (markdown doesn't support file scoping)
- **Manual-attach rules** (no globs, not alwaysApply) get flagged for review
- **No silent data loss.** Every non-1:1 conversion produces a warning.

## Options

```
--to <format>       Target format (required)
--from <format>     Source format (default: auto-detect)
--out <path>        Output file path
--dry-run           Preview without writing
```

## Next step: check your converted rules

After converting, make sure they actually work:

```bash
npx cursor-doctor scan    # Health check with letter grade
npx cursor-doctor lint    # Detailed rule-by-rule linting
```

**[cursor-doctor](https://github.com/nedcodes-ok/cursor-doctor)** catches broken frontmatter, conflicting instructions, and 100+ other issues. Also: **[rule-gen](https://github.com/nedcodes-ok/rule-gen)** generates rules from your codebase using AI. `npx rulegen-ai`

## License

MIT
