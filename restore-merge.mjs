import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const repo = "C:\\Users\\widadra\\Desktop\\kehila2026-mata-yehuda";
process.chdir(repo);

const log = [];
function run(cmd) {
  const out = execSync(cmd, { encoding: "utf8" });
  log.push(`$ ${cmd}\n${out}`);
  return out;
}

if (!existsSync(".git/MERGE_HEAD")) {
  try {
    run("git merge supportive-community --no-edit");
  } catch (e) {
    log.push(String(e.stdout || ""));
    log.push(String(e.stderr || ""));
  }
}

const unmerged = run('git diff --name-only --diff-filter=U').trim().split("\n").filter(Boolean);
log.push(`Unmerged: ${JSON.stringify(unmerged)}`);

writeFileSync("restore-merge-log.txt", log.join("\n\n"));
console.log("done", unmerged.length);
