/**
 * evaluate.js — Main entry point for the AI Workflow Evaluation Platform
 *
 * Usage: node eval/evaluate.js --project=<name> --session=<jsonl> --baseline=<ref> [--target=<ref>] [--no-judge]
 *
 * Pipeline:
 *   1. Run spec checkers → pass/fail matrix
 *   2. Parse session JSONL → token, message counts
 *   3. Parse git diff → code change stats
 *   4. Output CSV row + console report
 */

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(__dirname, 'output', 'results.csv');

// ── CLI Args ──────────────────────────────────────────────

const args = process.argv.slice(2).reduce((acc, a) => {
  const [k, v] = a.replace('--', '').split('=');
  acc[k] = v;
  return acc;
}, {});

const project = args.project || 'hamster';
const sessionPath = args.session;
const baselineRef = args.baseline || 'HEAD~1';
const targetRef = args.target || 'HEAD';
const port = args.port || '3000';
const baseUrl = `http://localhost:${port}`;

// ── Interactive: LLM credentials for AI Judge ──────────────

async function promptLLMCredentials() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const ask = (q) => new Promise(r => readline.question(q, r));

  console.log('── AI Judge Setup ──');
  console.log('(leave blank to skip AI judge, or set env vars LLM_API_KEY / LLM_BASE_URL / LLM_MODEL)\n');

  const key = process.env.LLM_API_KEY || await ask('  LLM API Key: ');
  if (!key) {
    console.log('  ⏭  No key provided. AI Judge will be skipped.\n');
    readline.close();
    return null;
  }

  const baseUrl = process.env.LLM_BASE_URL || await ask('  LLM Base URL (default: https://api.deepseek.com/v1): ') || 'https://api.deepseek.com/v1';
  const model = process.env.LLM_MODEL || await ask('  LLM Model (default: deepseek-chat): ') || 'deepseek-chat';

  readline.close();
  console.log(`  ✅ Judge ready: ${model} @ ${baseUrl}\n`);
  return { key, baseUrl, model };
}

// ── Load & Run Checkers ───────────────────────────────────

function loadCheckers(feature) {
  const checkerPath = path.join(__dirname, 'spec-checkers', project, `${feature}-checkers.js`);
  if (!fs.existsSync(checkerPath)) {
    console.warn(`  ⚠ No checker file for ${feature} at ${checkerPath}`);
    return [];
  }
  return require(checkerPath).checkers;
}

async function runChecker(checker, page) {
  try {
    if (checker.type === 'browser') {
      if (!page) return { pass: null, detail: 'no browser page' };
      // Inject base URL for page.goto
      page.__baseUrl = baseUrl;
      return await checker.check(page);
    }
    return await checker.check();
  } catch (err) {
    return { pass: false, detail: err.message };
  }
}

async function runFeatureCheckers(feature, page) {
  const checkers = loadCheckers(feature);
  if (checkers.length === 0) return { passed: 0, total: 0, details: [] };

  const results = [];
  for (const c of checkers) {
    const r = await runChecker(c, page);
    results.push({ id: c.id, criterion: c.criterion, ...r });
  }
  const passed = results.filter(r => r.pass).length;
  return { passed, total: results.length, details: results };
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  console.log('=== AI Workflow Eval Platform ===\n');
  console.log(`Project: ${project}`);
  console.log(`Session: ${sessionPath || 'N/A'}`);
  console.log(`Baseline: ${baselineRef} → Target: ${targetRef}\n`);

  // ── AI Judge credentials ──────────────────────────────────
  let judgeCredentials = null;
  if (useJudge) {
    judgeCredentials = await promptLLMCredentials();
  }

  // ── Step 1: Spec Checkers ───────────────────────────────
  console.log('── Step 1: Spec Checkers ──');

  let browser = null;
  let page = null;
  const hasBrowserCheckers = ['f1', 'f2', 'f3'].some(f => {
    const checkers = loadCheckers(f);
    return checkers.some(c => c.type === 'browser');
  });

  if (hasBrowserCheckers) {
    try {
      // Set base URL for checker page.goto() calls
      process.env.EVAL_BASE_URL = baseUrl;
      const puppeteer = require('puppeteer-core');
      // Use system Edge (Windows) — no Chromium download needed
      const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
      browser = await puppeteer.launch({
        executablePath: edgePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      // Create a blank page for checkers
      page = await browser.newPage();
      // Monkey-patch: redirect hardcoded localhost:3000 → actual port
      const _goto = page.goto.bind(page);
      page.goto = (url, opts) => _goto(url.replace('http://localhost:3000', baseUrl), opts);

      console.log(`  Browser launched (mapping :3000 → :${port})\n`);
    } catch {
      console.warn('  ⚠ Puppeteer not installed. Browser checks will be skipped.\n');
    }
  }

  const specResults = {};
  for (const f of ['f1', 'f2', 'f3']) {
    const r = await runFeatureCheckers(f, page);
    specResults[f] = r;
    if (r.total > 0) {
      console.log(`  ${f}: ${r.passed}/${r.total} passed`);
      r.details.forEach(d => {
        console.log(`    ${d.pass ? '✅' : '❌'} ${d.id}: ${d.detail}`);
      });
    }
  }

  if (browser) await browser.close();

  // ── Step 2: Session Parser ───────────────────────────────
  console.log('\n── Step 2: Session & Token Parser ──');

  let tokenData = {}, sessionData = {};
  if (sessionPath) {
    try {
      const { parse: parseTokens } = require('./parsers/token-parser');
      const { parse: parseSession } = require('./parsers/session-parser');
      tokenData = parseTokens(sessionPath);
      sessionData = parseSession(sessionPath);
      console.log(`  Tokens: in=${tokenData.input_tokens?.toLocaleString()} out=${tokenData.output_tokens?.toLocaleString()} total=${tokenData.total_tokens?.toLocaleString()}`);
      console.log(`  Messages: user=${sessionData.user_messages} agent=${sessionData.agent_responses} clarify=${sessionData.clarification_questions}`);
    } catch (err) {
      console.warn(`  ⚠ Session parse failed: ${err.message}`);
    }
  } else {
    console.log('  No session file provided (--session=). Skipped.');
  }

  // ── Step 3: Git Parser ───────────────────────────────────
  console.log('\n── Step 3: Git Parser ──');

  let gitData = {};
  try {
    const { parse: parseGit } = require('./parsers/git-parser');
    gitData = parseGit(ROOT, baselineRef, targetRef);
    console.log(`  Lines: +${gitData.lines_added} -${gitData.lines_deleted}`);
    console.log(`  Files: +${gitData.files_added} ~${gitData.files_modified} -${gitData.files_deleted}`);
    console.log(`  Commits: ${gitData.commits}`);
  } catch (err) {
    console.warn(`  ⚠ Git parse failed: ${err.message}`);
  }

  // ── Step 3.5: AI Judge (readability) ──────────────────────────
  console.log('\n── Step 3.5: AI Judge ──');

  let readabilityScore = '';
  if (judgeCredentials && gitData.lines_added > 0) {
    try {
      const { callJudge } = require('./judges/call');
      // Set env vars for the judge caller (not persisted)
      process.env.LLM_API_KEY = judgeCredentials.key;
      process.env.LLM_BASE_URL = judgeCredentials.baseUrl;
      process.env.LLM_MODEL = judgeCredentials.model;
      const result = await callJudge('readability', { diff: `Lines: +${gitData.lines_added} -${gitData.lines_deleted}, Files: +${gitData.files_added} ~${gitData.files_modified}` });
      readabilityScore = result.score || '';
      console.log(`  Readability: ${result.score}/5`);
      if (result.detail) console.log(`  ${result.detail.substring(0, 200)}`);
    } catch (err) {
      console.warn(`  ⚠ Judge failed: ${err.message}`);
    }
  } else {
    console.log('  Skipped (no judge credentials or no code changes).');
  }
  console.log('\n── Step 4: CSV Output ──');

  const totalSpecPassed = Object.values(specResults).reduce((s, r) => s + r.passed, 0);
  const totalSpecTotal = Object.values(specResults).reduce((s, r) => s + r.total, 0);

  const csvRow = [
    project,
    '', // feature — caller fills
    '', // start_time
    '', // end_time
    '', // time_min
    sessionData.user_messages || '',
    sessionData.agent_responses || '',
    sessionData.clarification_questions || '',
    '', // retry_cycles
    tokenData.input_tokens || '',
    tokenData.output_tokens || '',
    tokenData.total_tokens || '',
    gitData.lines_added || '',
    gitData.lines_deleted || '',
    gitData.files_added || '',
    gitData.files_modified || '',
    (totalSpecTotal - totalSpecPassed), // bugs = failed checks
    '', // human_intervention_level
    '', // run_success
    totalSpecPassed, // spec_pass_count
    totalSpecTotal,
    '', // regression_count
    readabilityScore,
    '', // auto_fixed
    '', // replanned
    '', // repeated_mistake
    '', // used_docs
    '', // reused_code
    '', // external_failure
    '', // notes
  ].join(',');

  // Write CSV only when session data is available
  if (sessionPath) {
    const header = 'project,feature,start_time,end_time,time_min,user_messages,agent_responses,clarification_questions,retry_cycles,input_tokens,output_tokens,total_tokens,lines_added,lines_deleted,files_added,files_modified,bugs,human_intervention_level,run_success,spec_pass_count,spec_total,regression_count,readability,auto_fixed,replanned,repeated_mistake,used_docs,reused_code,external_failure,notes\n';

    // Always write fresh (overwrite, not append) to avoid stale rows
    fs.writeFileSync(OUTPUT, header + csvRow + '\n', 'utf-8');
    console.log(`  Written to eval/output/results.csv`);
  } else {
    console.log('  ⏭ CSV skipped: no --session= provided.');
  }

  console.log('\n=== Done ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
