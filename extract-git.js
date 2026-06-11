import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const repo = '.';
const out = [];

function run(cmd) {
  try {
    return execSync(cmd, { cwd: repo, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || '') + (e.message || '');
  }
}

out.push('=== STATUS ===');
out.push(run('git status'));

out.push('=== CURRENT BRANCH ===');
out.push(run('git branch --show-current'));

if (!run('git rev-parse -q --verify MERGE_HEAD 2>nul').trim()) {
  out.push('=== MERGE ===');
  out.push(run('git merge supportive-community'));
}

out.push('=== STATUS AFTER ===');
out.push(run('git status'));

out.push('=== UNMERGED ===');
out.push(run('git diff --name-only --diff-filter=U'));

out.push('=== SUPPORTIVE COMMUNITY FILES ===');
out.push(run('git ls-tree -r --name-only supportive-community -- src/'));

out.push('=== COMMUNITY STAFF FILES ===');
out.push(run('git ls-tree -r --name-only CommunityStaffDashboard -- src/'));

const files = run('git diff --name-only --diff-filter=U').trim().split('\n').filter(Boolean);
for (const f of files) {
  out.push(`=== CONFLICT FILE: ${f} ===`);
  try {
    out.push(require('fs').readFileSync(f, 'utf8'));
  } catch (e) {
    out.push(String(e));
  }
}

writeFileSync('merge-extract-output.txt', out.join('\n'));
console.log('Done');
