/**
 * F2 Spec Checkers — Feed + Food Tray + LLM Chat
 */

const fs = require('fs');
const path = require('path');
const WORKSHOP_DIR = path.resolve(__dirname, '../../../workshop');

// ── Helpers ──────────────────────────────────────────────

async function pageHasSelector(page, selector) {
  const el = await page.$(selector);
  return { pass: !!el, detail: `"${selector}" exists` };
}

async function pageHasText(page, text) {
  const content = await page.content();
  return { pass: content.includes(text), detail: `contains "${text}"` };
}

async function elementHasStyle(page, selector, property, expected) {
  try {
    const val = await page.$eval(selector, (el, prop) => window.getComputedStyle(el)[prop], property);
    const pass = typeof expected === 'string' ? val.includes(expected) : val === expected;
    return { pass, detail: `${property}: ${val}` };
  } catch {
    return { pass: false, detail: `selector not found` };
  }
}

// ── Checkers ─────────────────────────────────────────────

const checkers = [
  // 1. Diary
  {
    id: 'f2-01-diary',
    criterion: '"{name}\'s Diary" 标题 + 3 条短帖子',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000/hamster', { waitUntil: 'networkidle2', timeout: 10000 });
      const hasDiaryTitle = await pageHasText(page, "Diary");
      const hasThreePosts = await page.$$eval('.diary-post, .feed-post, [class*="diary"]', els => els.length);
      const pass = hasDiaryTitle.pass && hasThreePosts >= 3;
      // Also check static data
      const dataContent = fs.readFileSync(path.join(WORKSHOP_DIR, 'src/data/hamsters.js'), 'utf-8');
      const diaryCount = (dataContent.match(/diary/g) || []).length;
      return { pass: pass && diaryCount >= 36, detail: `title:${hasDiaryTitle.pass} posts:${hasThreePosts} diaryEntries:${diaryCount}` };
    }
  },

  // 2. Food Tray: 12 buttons, golden border for favourite
  {
    id: 'f2-02-foodtray',
    criterion: '12 个食物按钮，最爱食物有金色边框',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000/hamster', { waitUntil: 'networkidle2', timeout: 10000 });
      const buttonCount = await page.$$eval('button', btns => btns.filter(b => /food|seed|berry|broccoli|carrot|apple|corn|peanut|oat|cucumber|banana|potato/i.test(b.textContent)).length);
      const hasGoldenBorder = await page.$$eval('[class*="favourite"], [class*="fav"], [style*="gold"]', els => els.length);
      const pass = buttonCount >= 12 && hasGoldenBorder > 0;
      return { pass, detail: `buttons:${buttonCount} goldenBorder:${hasGoldenBorder > 0}` };
    }
  },

  // 3. Mood system: hover penalty + favourite food + mood bar
  {
    id: 'f2-03-mood-system',
    criterion: 'Mood 系统：hover penalty、moodBoost、5 档进度条',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000/hamster', { waitUntil: 'networkidle2', timeout: 10000 });
      const hasMoodBar = await pageHasSelector(page, '[class*="mood"], [class*="progress"], [class*="bar"]');
      const content = await page.content();
      const hasMoodLabels = /Hungry|Sad|Neutral|Happy|Overjoyed/.test(content);
      const hasMoodLevels = /0.*19|20.*39|40.*59|60.*79|80.*100/.test(content);
      // Check source code for correct mood logic
      const srcDir = path.join(WORKSHOP_DIR, 'src');
      const allJS = findJSFiles(srcDir);
      const moodCode = allJS.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
      const hasClamping = /Math\.max\(0.*Math\.min\(100/.test(moodCode) || /clamp/.test(moodCode);
      const hasHoverPenalty = /2000|setTimeout/.test(moodCode) && /-5/.test(moodCode);
      const hasMoodBoost = /moodBoost/.test(moodCode) && /15|12|8|5|4/.test(moodCode);
      const pass = hasMoodBar.pass && hasMoodLabels && hasClamping && hasHoverPenalty && hasMoodBoost;
      return { pass, detail: `bar:${hasMoodBar.pass} labels:${hasMoodLabels} clamp:${hasClamping} hover:${hasHoverPenalty} boost:${hasMoodBoost}` };
    }
  },

  // 4. Chat: LLM integration, history, fallback
  {
    id: 'f2-04-chat',
    criterion: '聊天框：LLM 集成 + 历史 + fallback',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000/hamster', { waitUntil: 'networkidle2', timeout: 10000 });
      const hasChatInput = await pageHasSelector(page, 'input[type="text"], textarea');
      const hasSendButton = await pageHasSelector(page, 'button');
      const hasChatArea = await pageHasSelector(page, '[class*="chat"], [class*="message"]');
      // Check source for API proxy (key must NOT be in frontend code)
      const srcDir = path.join(WORKSHOP_DIR, 'src');
      const frontendCode = findJSFiles(srcDir).map(f => fs.readFileSync(f, 'utf-8')).join('\n');
      const keyNotLeaked = !frontendCode.includes('LLM_API_KEY') && !frontendCode.includes('sk-');
      // Check server exists
      const serverExists = fs.existsSync(path.join(WORKSHOP_DIR, 'server', 'index.js'))
        || fs.existsSync(path.join(WORKSHOP_DIR, 'server.js'));
      // Check fallback logic exists
      const hasFallback = /fallback|getFallback/i.test(frontendCode);
      const pass = hasChatInput.pass && hasSendButton.pass && hasChatArea.pass && keyNotLeaked && serverExists && hasFallback;
      return { pass, detail: `input:${hasChatInput.pass} send:${hasSendButton.pass} area:${hasChatArea.pass} keySafe:${keyNotLeaked} server:${serverExists} fallback:${hasFallback}` };
    }
  },
];

function findJSFiles(dir) {
  const results = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    fs.readdirSync(d).forEach(f => {
      const full = path.join(d, f);
      if (fs.statSync(full).isDirectory() && !f.includes('node_modules') && !f.includes('.git')) walk(full);
      else if (f.endsWith('.js') || f.endsWith('.jsx')) results.push(full);
    });
  }
  walk(dir);
  return results;
}

module.exports = { checkers };
