// Content guard, run before every build (npm prebuild + the publish Action).
// Fails the build when CMS-written Markdown contains syntax plain Astro Markdown would print
// as raw text, so a broken post never reaches staging or production.
//   - "{% ... %}" Markdoc tags (written by Keystatic's Markdoc field, e.g. tables)
//   - unresolved image references to files that do not exist
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const DIRS = ['src/content/journal', 'src/content/services'];
const problems = [];

for (const dir of DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const file of fs.readdirSync(abs).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))) {
    const full = path.join(abs, file);
    const text = fs.readFileSync(full, 'utf8');
    text.split(/\r?\n/).forEach((line, i) => {
      if (/\{%.*%\}/.test(line)) problems.push(`${dir}/${file}:${i + 1}  Markdoc tag would print as text: ${line.trim().slice(0, 80)}`);
      for (const m of line.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
        const ref = m[1];
        if (/^(https?:)?\/\//.test(ref) || ref.startsWith('/')) continue;
        if (!fs.existsSync(path.resolve(abs, ref))) problems.push(`${dir}/${file}:${i + 1}  image not found: ${ref}`);
      }
    });
    // frontmatter image fields (photo/cover) must point at real files
    for (const m of text.matchAll(/^(photo|cover): (.+)$/gm)) {
      const ref = m[2].trim().replace(/^['"]|['"]$/g, '');
      if (!fs.existsSync(path.resolve(abs, ref))) problems.push(`${dir}/${file}  ${m[1]} not found: ${ref}`);
    }
  }
}

// Every journal post's author must be an existing team member (renaming a team member's
// slug in the CMS does not update their posts, which would silently drop the byline).
const teamDir = path.join(ROOT, 'src/content/team');
const teamIds = new Set(fs.existsSync(teamDir) ? fs.readdirSync(teamDir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')) : []);
const journalDir = path.join(ROOT, 'src/content/journal');
for (const file of fs.existsSync(journalDir) ? fs.readdirSync(journalDir).filter((f) => f.endsWith('.md')) : []) {
  const m = fs.readFileSync(path.join(journalDir, file), 'utf8').match(/^author: ['"]?([^'"\r\n]+)['"]?\s*$/m);
  if (!m) problems.push(`src/content/journal/${file}  has no author`);
  else if (!teamIds.has(m[1].trim())) problems.push(`src/content/journal/${file}  author "${m[1].trim()}" is not a team member (was their slug renamed? re-select the author in the CMS)`);
}

if (problems.length) {
  console.error(`Content check failed (${problems.length}):\n` + problems.map((p) => '  ' + p).join('\n'));
  process.exit(1);
}
console.log('content check: ok');
