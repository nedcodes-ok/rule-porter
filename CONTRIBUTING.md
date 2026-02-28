# Contributing to rule-porter

Thanks for your interest in contributing! Here's how to get started.

## Quick Start

```bash
git clone https://github.com/nedcodes-ok/rule-porter.git
cd rule-porter
npm test
```

No build step. No dependencies to install. The project runs on Node.js built-in modules only.

## How to Contribute

1. **Fork** the repo
2. **Create a branch** (`git checkout -b my-fix`)
3. **Make your changes**
4. **Run tests** (`npm test`)
5. **Submit a PR**

## What We're Looking For

- Bug fixes
- New format parsers (add to `src/parsers/`)
- New format converters (add to `src/formats/`)
- Documentation improvements

Check the [issues labeled `good first issue`](https://github.com/nedcodes-ok/rule-porter/labels/good%20first%20issue) for beginner-friendly tasks.

## Code Style

- Zero external dependencies — use Node.js built-ins only
- Parsers go in `src/parsers/` and export a `discover(dir)` function
- Format converters go in `src/formats/` and export a `convert(rules)` function
- Error messages follow the pattern: `Error: <what failed>. <suggestion>`

## Adding a New Format

1. Create a parser in `src/parsers/<format>.js` with `discover(dir)`
2. Create a converter in `src/formats/<format>.js` with `convert(rules)`
3. Register both in `src/cli.js` (SOURCES and FORMATS objects)
4. Add tests

## Reporting Bugs

Open an issue with:
- What you expected
- What happened
- The source format and target format you used
- Your Node.js version (`node -v`)

## Questions?

Open an issue — happy to help.
