const fs = require('fs');
const path = require('path');

const src = path.join(process.env.USERPROFILE, 'Downloads');
const dest = path.join(__dirname, 'public', 'images', 'community-staff-dashboard');

const map = {
  'clipboard_illustration.png': 'clipboard.png',
  'hands_heart_illustration.png': 'hands-heart.png',
  'volunteer_character_illustration.png': 'volunteer-character.png',
  'people_illustration.png': 'people-group.png',
  'puzzle_illustration.png': 'puzzle.png',
  'megaphone_illustration.png': 'megaphone.png',
};

fs.mkdirSync(dest, { recursive: true });

const report = [];

for (const [fromName, toName] of Object.entries(map)) {
  const from = path.join(src, fromName);
  const to = path.join(dest, toName);
  try {
    if (!fs.existsSync(from)) {
      report.push(`MISSING: ${fromName}`);
      continue;
    }
    fs.copyFileSync(from, to);
    const stat = fs.statSync(to);
    report.push(`OK: ${toName} (${stat.size} bytes)`);
  } catch (err) {
    report.push(`ERROR: ${fromName} -> ${err.message}`);
  }
}

const landscapeCandidates = fs
  .readdirSync(src)
  .filter((name) => name.toLowerCase().endsWith('.png'))
  .filter((name) => /chatgpt|landscape|footer/i.test(name))
  .map((name) => ({
    name,
    mtime: fs.statSync(path.join(src, name)).mtimeMs,
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (landscapeCandidates.length > 0) {
  const landscapeSrc = path.join(src, landscapeCandidates[0].name);
  const landscapeDest = path.join(dest, 'landscape-footer.png');
  try {
    fs.copyFileSync(landscapeSrc, landscapeDest);
    const stat = fs.statSync(landscapeDest);
    report.push(`OK: landscape-footer.png from ${landscapeCandidates[0].name} (${stat.size} bytes)`);
  } catch (err) {
    report.push(`ERROR: landscape -> ${err.message}`);
  }
} else {
  report.push('MISSING: landscape image (ChatGPT Image*.png)');
}

const outFile = path.join(__dirname, 'copy-dashboard-images-report.txt');
fs.writeFileSync(outFile, report.join('\n') + '\n');
console.log(report.join('\n'));
