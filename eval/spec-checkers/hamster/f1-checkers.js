/**
 * F1 Spec Checkers — HomePage + Random Hamster
 *
 * 每条验收标准 → 一个 checker 函数，返回 { pass: boolean, detail: string }
 * 使用 Puppeteer + 静态文件检查
 */

const fs = require('fs');
const path = require('path');

const WORKSHOP_DIR = path.resolve(__dirname, '../../../workshop');

// ── Helpers ──────────────────────────────────────────────

async function checkFileExists(relativePath) {
  const full = path.join(WORKSHOP_DIR, relativePath);
  return { pass: fs.existsSync(full), detail: relativePath };
}

function readFileIfExists(relativePath) {
  const full = path.join(WORKSHOP_DIR, relativePath);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf-8') : '';
}

async function pageHasText(page, text, opts = {}) {
  const content = await page.content();
  const found = content.includes(text);
  return { pass: found, detail: opts.detail || `page contains "${text}"` };
}

async function pageHasSelector(page, selector, opts = {}) {
  const el = await page.$(selector);
  return { pass: !!el, detail: opts.detail || `selector "${selector}" exists` };
}

async function elementIsCircle(page, selector) {
  const borderRadius = await page.$eval(selector, el =>
    window.getComputedStyle(el).borderRadius
  );
  const isCircle = borderRadius.includes('50%') || parseInt(borderRadius) >= 50;
  return { pass: isCircle, detail: `border-radius: ${borderRadius}` };
}

async function elementHasBackgroundImage(page, selector, imageName) {
  const bg = await page.$eval(selector, el =>
    window.getComputedStyle(el).backgroundImage
  );
  const hasImage = bg.includes(imageName);
  return { pass: hasImage, detail: `background-image contains "${imageName}"` };
}

async function pageIsResponsive(page, width) {
  await page.setViewport({ width, height: 800 });
  const hasHorizontalScroll = await page.$eval('body', el =>
    el.scrollWidth > window.innerWidth + 20
  );
  return { pass: !hasHorizontalScroll, detail: `viewport ${width}px: ${hasHorizontalScroll ? 'horizontal scroll' : 'no horizontal scroll'}` };
}

// ── Checkers ─────────────────────────────────────────────

const checkers = [
  // 1. React + Vite project structure
  {
    id: 'f1-01-vite-project',
    criterion: 'React + Vite 项目启动成功',
    type: 'static',
    async check() {
      const hasPackageJson = fs.existsSync(path.join(WORKSHOP_DIR, 'package.json'));
      const hasViteConfig = fs.existsSync(path.join(WORKSHOP_DIR, 'vite.config.js'));
      const pkg = hasPackageJson ? JSON.parse(fs.readFileSync(path.join(WORKSHOP_DIR, 'package.json'), 'utf-8')) : {};
      const hasReact = pkg.dependencies?.react;
      const hasVite = pkg.dependencies?.vite || pkg.devDependencies?.vite;
      const pass = hasPackageJson && hasViteConfig && !!hasReact && !!hasVite;
      return { pass, detail: `React: ${!!hasReact}, Vite: ${!!hasVite}` };
    }
  },

  // 2. HomePage: home.jpg background + "Meet Today's Hamster" + → arrow
  {
    id: 'f1-02-homepage-route',
    criterion: '"/" 显示 HomePage',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
      const hasText = await pageHasText(page, "Meet Today's Hamster");
      const hasArrow = await pageHasText(page, '→');
      const hasBg = await elementHasBackgroundImage(page, 'a, div, main, section', 'home.jpg');
      const pass = hasText.pass && hasArrow.pass;
      return { pass, detail: `${hasText.detail} | arrow: ${hasArrow.pass} | home.jpg: ${hasBg.pass}` };
    }
  },

  // 3. /hamster page: circular photo, name, age, personality, food, hobby, bio
  {
    id: 'f1-03-hamsterpage-route',
    criterion: '"/hamster" 显示 HamsterPage',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000/hamster', { waitUntil: 'networkidle2', timeout: 10000 });
      const hasPhoto = await pageHasSelector(page, 'img[src*="hamsters"]');
      const isCircle = hasPhoto.pass ? await elementIsCircle(page, 'img[src*="hamsters"]') : { pass: false };
      const content = await page.content();
      const hasName = /[A-Z][a-z]+/.test(content); // any capitalized name
      const hasAge = /age|Age|month|year/i.test(content);
      const hasPersonality = /Gluttonous|Shy|Energetic|Chill|Chaotic|Picky|Friendly/i.test(content);
      const hasFood = /food|Favourite/i.test(content);
      const hasHobby = /hobby|Hobby/i.test(content);
      const hasBio = content.length > 500; // bio adds significant text
      const pass = hasPhoto.pass && isCircle.pass && hasName && hasAge && hasPersonality && hasFood && hasHobby && hasBio;
      return { pass, detail: `photo:${hasPhoto.pass} circle:${isCircle.pass} name:${hasName} age:${hasAge} personality:${hasPersonality} food:${hasFood} hobby:${hasHobby} bio:${hasBio}` };
    }
  },

  // 4. 12 hamsters data file
  {
    id: 'f1-04-hamster-data',
    criterion: '12 只仓鼠数据文件',
    type: 'static',
    async check() {
      const requiredFields = ['name', 'age', 'personality', 'favouriteFood', 'hobby', 'bio', 'image', 'catchphrase', 'moodBoost'];
      const dataFile = readFileIfExists('src/data/hamsters.js') || readFileIfExists('src/data/hamsters.json');
      const count = (dataFile.match(/name:/g) || []).length;
      const allFields = requiredFields.every(f => dataFile.includes(f));
      const hasFoodIds = /sunflower-seeds|strawberries|broccoli|carrots|apples|sweet-corn|peanuts|blueberries|sweet-potato|cinnamon-oats|cucumber|banana-chips/.test(dataFile);
      const allPersonalities = ['Gluttonous', 'Shy', 'Energetic', 'Chill', 'Chaotic', 'Picky', 'Friendly'].every(p => dataFile.includes(p));
      const pass = count >= 12 && allFields && hasFoodIds && allPersonalities;
      return { pass, detail: `count:${count} allFields:${allFields} foodIds:${hasFoodIds} personalities:${allPersonalities}` };
    }
  },

  // 5. "Visit Another" button
  {
    id: 'f1-05-visit-another',
    criterion: '"Visit Another" 按钮',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000/hamster', { waitUntil: 'networkidle2', timeout: 10000 });
      const btn = await pageHasText(page, 'Visit Another');
      if (!btn.pass) return { pass: false, detail: 'button not found' };
      // Click it and verify hamster changes
      const before = await page.$eval('h2', el => el.textContent).catch(() => '');
      await page.click('button');
      await page.waitForTimeout(500);
      const after = await page.$eval('h2', el => el.textContent).catch(() => '');
      const pass = before !== after;
      return { pass, detail: `before:"${before}" → after:"${after}"` };
    }
  },

  // 6. Navbar
  {
    id: 'f1-06-navbar',
    criterion: '导航栏品牌名 + Home + Today\'s Hamster 链接',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
      const content = await page.content();
      const hasBrand = content.includes('Hamster Daily');
      const hasHome = /href="\/"/.test(content);
      const hasHamsterLink = /href="\/hamster"/.test(content);
      const pass = hasBrand && hasHome && hasHamsterLink;
      return { pass, detail: `brand:${hasBrand} home:${hasHome} hamster:${hasHamsterLink}` };
    }
  },

  // 7. Mobile responsive
  {
    id: 'f1-07-mobile',
    criterion: '移动端纵向堆叠布局',
    type: 'browser',
    async check(page) {
      await page.goto('http://localhost:3000/hamster', { waitUntil: 'networkidle2', timeout: 10000 });
      const mobile = await pageIsResponsive(page, 375);
      // Also check CSS for @media
      const cssFiles = findCSSFiles(WORKSHOP_DIR);
      const hasMediaQuery = cssFiles.some(f => fs.readFileSync(f, 'utf-8').includes('@media'));
      const pass = mobile.pass && hasMediaQuery;
      return { pass, detail: `${mobile.detail} | @media: ${hasMediaQuery}` };
    }
  },
];

function findCSSFiles(dir) {
  const results = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    fs.readdirSync(d).forEach(f => {
      const full = path.join(d, f);
      if (fs.statSync(full).isDirectory() && !f.includes('node_modules')) walk(full);
      else if (f.endsWith('.css')) results.push(full);
    });
  }
  walk(dir);
  return results;
}

module.exports = { checkers };
