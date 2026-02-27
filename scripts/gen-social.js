const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 640 });

  const html = `<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1280px; height: 640px;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d1117 100%);
  font-family: 'Inter', sans-serif;
  color: #e6edf3;
  display: flex;
  overflow: hidden;
}
.left {
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.badge {
  display: inline-block;
  background: rgba(97, 218, 251, 0.15);
  color: #61dafb;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 20px;
  width: fit-content;
}
h1 {
  font-size: 52px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff, #61dafb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sub {
  font-size: 18px;
  color: #8b949e;
  line-height: 1.5;
  max-width: 400px;
}
.formats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}
.format-tag {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 5px 12px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #c9d1d9;
}
.right {
  flex: 1;
  padding: 40px 60px 40px 20px;
  display: flex;
  align-items: center;
}
.terminal {
  background: #161b22;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.7;
}
.dots {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-r { background: #ff5f57; }
.dot-y { background: #febc2e; }
.dot-g { background: #28c840; }
.dim { color: #484f58; }
.cyan { color: #61dafb; }
.green { color: #3fb950; }
.yellow { color: #d29922; }
.white { color: #e6edf3; }
.bold { font-weight: 700; }
.arrow { color: #61dafb; }
</style>
</head>
<body>
<div class="left">
  <div class="badge">npx rule-porter</div>
  <h1>rule-porter</h1>
  <div class="sub">Convert AI IDE rules between Cursor, Claude Code, Copilot, Windsurf, and AGENTS.md. Bidirectional. Zero dependencies.</div>
  <div class="formats">
    <span class="format-tag">.mdc</span>
    <span class="format-tag">CLAUDE.md</span>
    <span class="format-tag">AGENTS.md</span>
    <span class="format-tag">.copilot</span>
    <span class="format-tag">.windsurfrules</span>
    <span class="format-tag">.cursorrules</span>
  </div>
</div>
<div class="right">
  <div class="terminal">
    <div class="dots">
      <span class="dot dot-r"></span>
      <span class="dot dot-y"></span>
      <span class="dot dot-g"></span>
    </div>
    <div><span class="dim">$</span> <span class="white">npx rule-porter --to agents-md</span></div>
    <br>
    <div><span class="cyan bold">  rule-porter</span> <span class="dim">v2.0.0</span></div>
    <br>
    <div>  <span class="bold white">Source:</span>  <span class="dim">.cursor/rules/ (6 rules)</span></div>
    <div>  <span class="bold white">Target:</span>  <span class="dim">AGENTS.md</span></div>
    <br>
    <div>  <span class="green">✓ 2 global</span>  <span class="cyan">4 conditional</span></div>
    <br>
    <div>  <span class="yellow">⚠</span>  <span class="dim">typescript:</span> <span class="dim">Glob "**/*.ts" → comment</span></div>
    <div>  <span class="yellow">⚠</span>  <span class="dim">testing:</span> <span class="dim">Glob "**/*.test.ts" → comment</span></div>
    <br>
    <div>  <span class="green">✓</span> <span class="white bold">Written to AGENTS.md</span></div>
    <br>
    <div>  <span class="dim">6 rules converted · 2 warnings</span></div>
  </div>
</div>
</body>
</html>`;

  await page.setContent(html);
  await page.waitForTimeout(2000);

  const outPath = path.join(__dirname, '..', 'docs', 'social-preview.png');
  const { mkdirSync } = require('fs');
  mkdirSync(path.dirname(outPath), { recursive: true });

  await page.screenshot({ path: outPath, type: 'png' });
  console.log('Social preview saved to', outPath);

  await browser.close();
})();
