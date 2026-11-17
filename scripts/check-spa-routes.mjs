// Verifies every top-level route in src/App.tsx is served by vercel.json and nginx.conf,
// so the 404 handling never blocks a real CRM route.
import { readFileSync } from 'node:fs';

const app = readFileSync('src/App.tsx', 'utf8');
const routes = [...new Set([...app.matchAll(/path="\/([a-z0-9-]+)/gi)].map((m) => m[1]))];

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const vercelRe = vercel.rewrites.map((r) => r.source).join(' ');
const nginx = readFileSync('nginx.conf', 'utf8');

const missing = [];
for (const r of routes) {
  const inList = (s) => new RegExp(`[(|]${r}[|)]`).test(s);
  if (!inList(vercelRe)) missing.push(`vercel.json: /${r}`);
  if (!inList(nginx)) missing.push(`nginx.conf: /${r}`);
}

if (missing.length) {
  console.error('Routes missing from server SPA config:\n  ' + missing.join('\n  '));
  process.exit(1);
}
console.log(`OK: ${routes.length} top-level routes covered in vercel.json and nginx.conf`);
