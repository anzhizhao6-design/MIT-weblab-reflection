/**
 * Git Parser — Extract code change metrics from git diff
 * Project-agnostic. Input: repo path, baseline ref, target ref.
 */

const { execSync } = require('child_process');

function parse(repoPath, baselineRef, targetRef = 'HEAD') {
  const opts = { cwd: repoPath, encoding: 'utf-8' };

  // Lines added/deleted
  const stat = execSync(`git diff --stat ${baselineRef}..${targetRef}`, opts);
  const match = stat.match(/(\d+) files? changed(?:, (\d+) insertion)?(?:, (\d+) deletion)?/);
  const filesChanged = match ? parseInt(match[1]) : 0;
  const linesAdded = match && match[2] ? parseInt(match[2]) : 0;
  const linesDeleted = match && match[3] ? parseInt(match[3]) : 0;

  // Files created vs modified
  const diffFiles = execSync(`git diff --name-status ${baselineRef}..${targetRef}`, opts);
  const fileLines = diffFiles.trim().split('\n').filter(l => l.trim());
  const filesAdded = fileLines.filter(l => l.startsWith('A\t')).length;
  const filesModified = fileLines.filter(l => l.startsWith('M\t')).length;
  const filesDeleted = fileLines.filter(l => l.startsWith('D\t')).length;

  // Commit count
  const commitLog = execSync(`git log --oneline ${baselineRef}..${targetRef}`, opts);
  const commits = commitLog.trim().split('\n').filter(l => l.trim()).length;

  return {
    lines_added: linesAdded,
    lines_deleted: linesDeleted,
    files_added: filesAdded,
    files_modified: filesModified,
    files_deleted: filesDeleted,
    files_changed: filesChanged,
    commits,
  };
}

module.exports = { parse };
