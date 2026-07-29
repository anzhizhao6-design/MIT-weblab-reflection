/**
 * F3 Spec Checkers — Database + Persistent Memory
 */

const fs = require('fs');
const path = require('path');
const WORKSHOP_DIR = path.resolve(__dirname, '../../../workshop');

// ── Helpers ──────────────────────────────────────────────

async function pageHasText(page, text) {
  const content = await page.content();
  return { pass: content.includes(text), detail: `contains "${text}"` };
}

async function pageHasSelector(page, selector) {
  const el = await page.$(selector);
  return { pass: !!el, detail: `"${selector}" exists` };
}

// ── Checkers ─────────────────────────────────────────────

const checkers = [
  // 1. MongoDB + Mongoose connection
  {
    id: 'f3-01-mongo-setup',
    criterion: 'MongoDB Atlas 连接（Mongoose）',
    type: 'static',
    async check() {
      const serverCode = readServerCode();
      const hasMongoose = serverCode.includes('mongoose');
      const hasConnect = serverCode.includes('mongoose.connect') || serverCode.includes('connectDb');
      const hasMONGO_SRV = serverCode.includes('MONGO_SRV') || serverCode.includes('process.env');
      const hasModels = fs.existsSync(path.join(WORKSHOP_DIR, 'server', 'models')) || fs.existsSync(path.join(WORKSHOP_DIR, 'models'));
      const pass = hasMongoose && hasConnect && hasMONGO_SRV && hasModels;
      return { pass, detail: `mongoose:${hasMongoose} connect:${hasConnect} env:${hasMONGO_SRV} models:${hasModels}` };
    }
  },

  // 2. Required collections
  {
    id: 'f3-02-collections',
    criterion: '集合：hamsters, feed_posts, users, conversations, hamster_memories',
    type: 'static',
    async check() {
      const required = [
        { keyword: 'hamster', name: 'hamsters' },
        { keyword: 'feed', name: 'feed_posts' },
        { keyword: 'user', name: 'users' },
        { keyword: 'conversation', name: 'conversations' },
        { keyword: 'hamster', pattern: /hamster[_-]?memor/i, name: 'hamster_memories' },
      ];
      let allCode = findJSFiles(path.join(WORKSHOP_DIR, 'server'))
        .concat(findJSFiles(path.join(WORKSHOP_DIR, 'models')))
        .concat(findJSFiles(path.join(WORKSHOP_DIR, 'routes')))
        .map(f => fs.readFileSync(f, 'utf-8')).join('\n');
      const rootServer = path.join(WORKSHOP_DIR, 'server.js');
      if (fs.existsSync(rootServer)) {
        allCode += fs.readFileSync(rootServer, 'utf-8');
      }
      let found = 0;
      const missing = [];
      for (const r of required) {
        if (r.pattern ? r.pattern.test(allCode) : allCode.toLowerCase().includes(r.keyword.toLowerCase())) {
          found++;
        } else {
          missing.push(r.name);
        }
      }
      const pass = found >= 5;
      return { pass, detail: `found:${found}/5${missing.length ? ' missing:' + missing.join(',') : ''}` };
    }
  },

  // 3. Seed script
  {
    id: 'f3-03-seed',
    criterion: 'npm run db:seed 导入 12 只仓鼠 + 36 条日记',
    type: 'static',
    async check() {
      const pkg = JSON.parse(fs.readFileSync(path.join(WORKSHOP_DIR, 'package.json'), 'utf-8'));
      const hasSeedScript = pkg.scripts && pkg.scripts['db:seed'];
      const seedFile = hasSeedScript ? findSeedFile() : '';
      const seedContent = seedFile ? fs.readFileSync(seedFile, 'utf-8') : '';
      const has12Hamsters = /12/.test(seedContent) || /hamsters\.(map|forEach|length)/.test(seedContent);
      const has36Diary = /36/.test(seedContent) || /3.*12/.test(seedContent);
      const pass = !!hasSeedScript && has12Hamsters;
      return { pass, detail: `script:${!!hasSeedScript} hamsters:${has12Hamsters} diary:${has36Diary}` };
    }
  },

  // 4. API endpoints
  {
    id: 'f3-04-api-endpoints',
    criterion: 'API 端点：hamsters/random, chat, visit, feed, memory, users, users/:id',
    type: 'static',
    async check() {
      const serverCode = readServerCode();
      const endpoints = [
        '/api/hamsters/random',
        '/api/chat',
        '/api/visit',
        '/api/feed',
        '/api/memory',
        '/api/users',
      ];
      const found = endpoints.filter(e => serverCode.includes(e));
      const pass = found.length >= 6;
      return { pass, detail: `endpoints: ${found.join(', ')}` };
    }
  },

  // 5. .env + .gitignore
  {
    id: 'f3-05-env-security',
    criterion: '.env 存储密钥，.gitignore 排除 .env',
    type: 'static',
    async check() {
      const gitignore = fs.existsSync(path.join(WORKSHOP_DIR, '.gitignore'))
        ? fs.readFileSync(path.join(WORKSHOP_DIR, '.gitignore'), 'utf-8')
        : '';
      const hasEnvGitignore = gitignore.includes('.env');
      const envFile = fs.existsSync(path.join(WORKSHOP_DIR, '.env'));
      const envContent = envFile ? fs.readFileSync(path.join(WORKSHOP_DIR, '.env'), 'utf-8') : '';
      const hasKeys = /LLM_API_KEY|MONGO_SRV/.test(envContent);
      const pass = hasEnvGitignore && hasKeys;
      return { pass, detail: `gitignore:${hasEnvGitignore} envKeys:${hasKeys}` };
    }
  },

  // 6. Visit + Feed recording
  {
    id: 'f3-06-visit-feed-recording',
    criterion: '每次 visit/feed 记录到 DB',
    type: 'static',
    async check() {
      const serverCode = readServerCode();
      const hasVisitRoute = serverCode.includes('/api/visit');
      const hasFeedRoute = serverCode.includes('/api/feed');
      const hasMemoryModel = serverCode.includes('HamsterMemory') || serverCode.includes('hamsterMemory');
      const pass = hasVisitRoute && hasFeedRoute && hasMemoryModel;
      return { pass, detail: `visit:${hasVisitRoute} feed:${hasFeedRoute} memory:${hasMemoryModel}` };
    }
  },

  // 7. Profile card: Visited X times + Fed X times
  {
    id: 'f3-07-profile-card',
    criterion: 'Profile 卡片显示 "Visited X times" 和 "Fed X times"',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000/hamster', { waitUntil: 'networkidle2', timeout: 10000 });
      const content = await page.content();
      const hasVisitedText = /Visited|visit/i.test(content);
      const hasFedText = /Fed|feed/i.test(content);
      const hasCounts = /\d+/.test(content); // some number shown
      const pass = hasVisitedText && hasFedText && hasCounts;
      return { pass, detail: `visited:${hasVisitedText} fed:${hasFedText} counts:${hasCounts}` };
    }
  },

  // 8. Chat memory injection + UUID identity
  {
    id: 'f3-08-chat-memory-identity',
    criterion: '聊天记忆注入 + UUID 身份',
    type: 'static',
    async check() {
      const allCode = findJSFiles(path.join(WORKSHOP_DIR, 'src'))
        .concat(findJSFiles(path.join(WORKSHOP_DIR, 'server')))
        .concat(findJSFiles(path.join(WORKSHOP_DIR, 'models')))
        .concat(findJSFiles(path.join(WORKSHOP_DIR, 'routes')))
        .map(f => fs.readFileSync(f, 'utf-8')).join('\n');
      const rootServer = fs.existsSync(path.join(WORKSHOP_DIR, 'server.js')) ? fs.readFileSync(path.join(WORKSHOP_DIR, 'server.js'), 'utf-8') : '';
      const fullCode = allCode + rootServer;
      const hasMemoryInjection = /Memory:|memoryContext|memory.*visit.*feed/i.test(fullCode);
      const hasUUID = /crypto\.randomUUID|uuid|localStorage/.test(fullCode);
      const hasAccountPanel = /Account|account|switch.*device|paste.*id/i.test(fullCode);
      const pass = hasMemoryInjection && hasUUID && hasAccountPanel;
      return { pass, detail: `memory:${hasMemoryInjection} uuid:${hasUUID} account:${hasAccountPanel}` };
    }
  },
];

// ── Helpers ──────────────────────────────────────────────

function readServerCode() {
  const code = [];
  // Scan multiple possible server code locations
  const paths = [
    path.join(WORKSHOP_DIR, 'server'),
    path.join(WORKSHOP_DIR, 'models'),
    path.join(WORKSHOP_DIR, 'routes'),
  ];
  // Also check root-level server files
  const rootFiles = ['server.js', 'seed.js', 'db.js'];
  for (const f of rootFiles) {
    const full = path.join(WORKSHOP_DIR, f);
    if (fs.existsSync(full)) code.push(fs.readFileSync(full, 'utf-8'));
  }
  for (const dir of paths) {
    if (fs.existsSync(dir)) {
      findJSFiles(dir).forEach(f => { code.push(fs.readFileSync(f, 'utf-8')); });
    }
  }
  return code.join('\n');
}

function findSeedFile() {
  const candidates = ['seed.js', 'db/seed.js', 'server/db/seed.js', 'server/seed.js'];
  for (const c of candidates) {
    const full = path.join(WORKSHOP_DIR, c);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

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
