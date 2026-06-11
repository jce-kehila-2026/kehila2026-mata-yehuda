import { inflateSync } from "node:zlib";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const repo = "C:\\Users\\widadra\\Desktop\\kehila2026-mata-yehuda";

function readGitBlob(sha) {
  const p = join(repo, ".git", "objects", sha.slice(0, 2), sha.slice(2));
  const raw = inflateSync(readFileSync(p));
  const nul = raw.indexOf(0);
  return raw.subarray(nul + 1).toString("utf8");
}

function readGitTree(sha) {
  const body = readGitBlob(sha);
  const entries = [];
  let i = 0;
  while (i < body.length) {
    const space = body.indexOf(" ", i);
    const mode = body.slice(i, space);
    const tab = body.indexOf("\0", space);
    const name = body.slice(space + 1, tab);
    const entrySha = body.slice(tab + 1, tab + 21).toString("hex");
    entries.push({ mode, name, sha: entrySha });
    i = tab + 21;
  }
  return entries;
}

function walkTree(prefix, sha, files = []) {
  for (const entry of readGitTree(sha)) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.mode === "40000") {
      walkTree(path, entry.sha, files);
    } else if (entry.mode === "100644") {
      files.push({ path, sha: entry.sha });
    }
  }
  return files;
}

const commitSha = readFileSync(join(repo, ".git", "refs", "heads", "supportive-community"), "utf8").trim();
const commitBody = readGitBlob(commitSha);
const treeSha = commitBody.match(/tree ([0-9a-f]{40})/)[1];
const allFiles = walkTree("", treeSha).filter((f) => f.path.startsWith("src/"));

for (const file of allFiles) {
  const content = readGitBlob(file.sha);
  const outPath = join(repo, file.path);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, content, "utf8");
  console.log("wrote", file.path);
}

writeFileSync(join(repo, "extract-blobs-log.txt"), allFiles.map((f) => f.path).join("\n"));
console.log("total", allFiles.length);
