import { inflateSync } from "node:zlib";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const repo = "C:\\Users\\widadra\\Desktop\\kehila2026-mata-yehuda";
const log = [];

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

function extractBranch(refName) {
  const commitSha = readFileSync(join(repo, ".git", "refs", "heads", refName), "utf8").trim();
  const commitBody = readGitBlob(commitSha);
  const treeSha = commitBody.match(/tree ([0-9a-f]{40})/)[1];
  return walkTree("", treeSha);
}

function writeBlobFile(relPath, sha) {
  const content = readGitBlob(sha);
  const outPath = join(repo, relPath);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, content, "utf8");
  log.push(`extracted: ${relPath}`);
  return content;
}

// 1. Extract all supportive-community src files (preserve latest SC implementation)
const scFiles = extractBranch("supportive-community").filter((f) => f.path.startsWith("src/"));
for (const file of scFiles) {
  writeBlobFile(file.path, file.sha);
}

// 2. Merged App.jsx - both route sets
writeFileSync(
  join(repo, "src/App.jsx"),
  `import { BrowserRouter, Routes, Route } from "react-router-dom";
import supportiveCommunityRoutes from "./routes/supportive community/supportiveCommunityRoutes";
import communityStaffRoutes from "./routes/communityStaff/communityStaffRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {supportiveCommunityRoutes.map((route) => (
          <Route
            key={\`sc-\${route.path}\`}
            path={route.path}
            element={route.element}
          />
        ))}
        {communityStaffRoutes.map((route) => (
          <Route
            key={\`cs-\${route.path}\`}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
  "utf8"
);
log.push("merged: src/App.jsx");

// 3. Fix community staff routes - remove "/" to avoid clash with SC landing
const staffRoutesPath = join(repo, "src/routes/communityStaff/communityStaffRoutes.jsx");
let staffRoutes = readFileSync(staffRoutesPath, "utf8");
if (staffRoutes.includes('path: "/"')) {
  staffRoutes = staffRoutes.replace(
    /\s*\{\s*path: "\/",\s*element: <CommunityStaffDashboardPage \/>,\s*\},?\s*/,
    "\n"
  );
  writeFileSync(staffRoutesPath, staffRoutes, "utf8");
  log.push("merged: communityStaffRoutes.jsx (removed duplicate / route)");
}

// 4. main.jsx - keep index.css import from current branch
writeFileSync(
  join(repo, "src/main.jsx"),
  `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,
  "utf8"
);
log.push("merged: src/main.jsx");

// 5. firebase.js - unified export compatible with both branches
writeFileSync(
  join(repo, "src/config/firebase.js"),
  `import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXSKuacUxiGkEraG772OCAivOdoftCE6I",
  authDomain: "matayehuda.firebaseapp.com",
  projectId: "matayehuda",
  storageBucket: "matayehuda.firebasestorage.app",
  messagingSenderId: "264845791661",
  appId: "1:264845791661:web:bac32332d00b6323671124",
  measurementId: "G-81XHVPCSNV",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
`,
  "utf8"
);
log.push("merged: src/config/firebase.js");

// 6. index.css - keep community staff base; SC pages use their own CSS
// (local index.css already present, no overwrite needed)
log.push("kept: src/index.css (local CommunityStaffDashboard base styles)");

writeFileSync(join(repo, "merge-log.txt"), log.join("\n"));
console.log(log.join("\n"));
