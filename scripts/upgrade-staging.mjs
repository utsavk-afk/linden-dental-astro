// Adds the October 2026 CMS features (taxonomies, bylines, footer widget area, sections,
// comments, search) to a database that was set up from an OLDER seed, without touching content.
//
// The setup wizard applies seed/seed.json only to an empty database, so a live database (PSI
// staging) never sees new seed structures. This script takes them from seed/seed.json and applies
// them with EmDash's own seed engine (onConflict "skip"), plus the few steps "skip" leaves out:
//   - taxonomies, terms, bylines, sections:  created when missing, existing ones left alone
//   - footer widget area:                    created only when no area of that name exists
//                                            (the seed engine replaces an area's widgets)
//   - menus, settings, collections, content: NOT applied (the seed engine rewrites menu items)
//   - comments on journal:                   switched on once (never again, so turning comments
//                                            off later in the admin sticks)
//   - category/tag terms on journal posts:   added only to posts with no term in that taxonomy;
//                                            the category follows each post's Category field,
//                                            tags come from the seed (seed posts only)
//   - "Clinically reviewed by" bylines:      added only to seed posts with no byline credits
//   - full-text search:                      enabled for seed collections that support it
// A snapshot of the database is written next to it first (<db>.pre-upgrade-<time>.db).
//
// Usage (from the app directory; inside the PSI Fly machine that is /app/linden):
//   node scripts/upgrade-staging.mjs --db /app/data/linden/emdash.db --dry-run    report only
//   node scripts/upgrade-staging.mjs --db /app/data/linden/emdash.db --restart    apply + restart
// Options: --db <file> (default $LINDEN_DB or ./data/emdash.db), --seed <file> (default
// seed/seed.json next to this script), --dry-run (runs against a temporary copy), --restart
// (stops the running site server so scripts/start.sh restarts it with fresh caches), --no-backup.
// Run as root it switches to the database file's owner, so new files stay writable by the app.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MARKER = 'linden:upgrade:2026-10-cms-features';

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const dbPath = path.resolve(opt('db', process.env.LINDEN_DB || 'data/emdash.db'));
const seedPath = path.resolve(opt('seed', path.join(HERE, '..', 'seed', 'seed.json')));
const dryRun = flag('dry-run');
const restart = flag('restart') && !dryRun;
const backup = !flag('no-backup') && !dryRun;

if (!fs.existsSync(dbPath)) fail(`database not found: ${dbPath}`);
if (!fs.existsSync(seedPath)) fail(`seed not found: ${seedPath}`);

function fail(message) {
  console.error(`[upgrade] ${message}`);
  process.exit(1);
}
const log = (...a) => console.log('[upgrade]', ...a);

// Root (fly ssh console) -> the database owner, so the -wal/-shm and backup files it creates
// stay writable by the app user.
if (typeof process.getuid === 'function' && process.getuid() === 0) {
  const st = fs.statSync(dbPath);
  if (st.uid !== 0) {
    process.setgid(st.gid);
    process.setuid(st.uid);
    log(`running as uid ${st.uid} (owner of the database)`);
  }
}

// ---------------------------------------------------------------------------
// Snapshot (consistent even while the site is running: VACUUM INTO reads one transaction)
// ---------------------------------------------------------------------------
function snapshot(to) {
  const src = new DatabaseSync(dbPath);
  try {
    src.exec('PRAGMA busy_timeout = 10000');
    src.exec(`VACUUM INTO '${to.replace(/'/g, "''")}'`);
  } finally {
    src.close();
  }
}

let target = dbPath;
if (dryRun) {
  target = path.join(os.tmpdir(), `linden-upgrade-dry-run-${Date.now()}.db`);
  snapshot(target);
  log(`dry run on a copy: ${target}`);
} else if (backup) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = `${dbPath}.pre-upgrade-${stamp}.db`;
  snapshot(file);
  log(`backup written: ${file}`);
}

// ---------------------------------------------------------------------------
// EmDash (seed engine, schema registry, search) on a Kysely connection
// ---------------------------------------------------------------------------
const { Kysely, sql } = await import('kysely');
const { createDialect } = await import('emdash/db/sqlite');
const { applySeed, getMigrationStatus, SchemaRegistry, FTSManager, ulid, slugify } = await import('emdash');

const db = new Kysely({ dialect: createDialect({ url: `file:${target}` }) });
await sql`PRAGMA busy_timeout = 10000`.execute(db);

const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const summary = {};

try {
  const status = await getMigrationStatus(db);
  if (status.pending.length > 0) {
    fail(`the database has ${status.pending.length} pending EmDash migrations; start the site once (it migrates on boot), then rerun`);
  }

  // 1. Seed structures through the seed engine. No collections/menus/settings/content.
  const areaNames = new Set((await db.selectFrom('_emdash_widget_areas').select('name').execute()).map((r) => r.name));
  const partial = {
    version: '1',
    taxonomies: seed.taxonomies ?? [],
    bylines: seed.bylines ?? [],
    sections: seed.sections ?? [],
    widgetAreas: (seed.widgetAreas ?? []).filter((a) => !areaNames.has(a.name)),
  };
  const result = await applySeed(db, partial, { includeContent: true, onConflict: 'skip', skipMediaDownload: true });
  summary.seed = {
    taxonomies: result.taxonomies,
    bylines: result.bylines,
    sections: result.sections,
    widgetAreas: result.widgetAreas,
    widgetAreasAlreadyThere: (seed.widgetAreas ?? []).filter((a) => areaNames.has(a.name)).map((a) => a.name),
  };

  // 2. Taxonomies the seed engine skipped (an edited definition) still need the seed's collections.
  summary.taxonomyCollections = [];
  for (const t of seed.taxonomies ?? []) {
    for (const table of ['_emdash_taxonomy_def_groups', '_emdash_taxonomy_defs']) {
      const rows = await db.selectFrom(table).select(['id', 'collections']).where('name', '=', t.name).execute();
      for (const row of rows) {
        const have = JSON.parse(row.collections || '[]');
        const missing = (t.collections ?? []).filter((c) => !have.includes(c));
        if (!missing.length) continue;
        await db.updateTable(table).set({ collections: JSON.stringify([...have, ...missing]) }).where('id', '=', row.id).execute();
        summary.taxonomyCollections.push(`${t.name}: +${missing.join(',')} (${table})`);
      }
    }
  }

  // 3. Comments, once.
  const done = await db.selectFrom('options').select('value').where('name', '=', MARKER).executeTakeFirst();
  const registry = new SchemaRegistry(db);
  summary.comments = [];
  for (const c of seed.collections ?? []) {
    if (!c.commentsEnabled) continue;
    const row = await db.selectFrom('_emdash_collections').select('comments_enabled').where('slug', '=', c.slug).executeTakeFirst();
    if (!row) continue;
    if (row.comments_enabled) summary.comments.push(`${c.slug}: already on`);
    else if (done) summary.comments.push(`${c.slug}: off, left off (upgrade ran before)`);
    else {
      await registry.updateCollection(c.slug, { commentsEnabled: true });
      summary.comments.push(`${c.slug}: switched on`);
    }
  }

  // 4. Term assignments and byline credits on existing entries.
  summary.terms = [];
  summary.bylines = [];
  for (const [collection, entries] of Object.entries(seed.content ?? {})) {
    const taxonomies = (seed.taxonomies ?? []).filter((t) => (t.collections ?? []).includes(collection));
    const credited = entries.some((e) => e.bylines?.length);
    if (!taxonomies.length && !credited) continue;
    const table = `ec_${collection}`;
    const columns = new Set((await sql`SELECT name FROM pragma_table_info(${table})`.execute(db)).rows.map((r) => r.name));
    const rows = (
      await sql`SELECT id, slug, translation_group, primary_byline_id ${columns.has('category') ? sql`, category` : sql``}
        FROM ${sql.table(table)} WHERE deleted_at IS NULL`.execute(db)
    ).rows;
    const seedBySlug = new Map(entries.map((e) => [e.slug, e]));

    for (const row of rows) {
      const entryGroup = row.translation_group ?? row.id;
      const fromSeed = seedBySlug.get(row.slug);

      for (const t of taxonomies) {
        const has = await db
          .selectFrom('content_taxonomies as ct')
          .innerJoin('taxonomies as tx', (j) => j.onRef('tx.translation_group', '=', 'ct.taxonomy_id'))
          .select('ct.taxonomy_id')
          .where('ct.collection', '=', collection)
          .where('ct.entry_id', '=', entryGroup)
          .where('tx.name', '=', t.name)
          .executeTakeFirst();
        if (has) continue;
        let slugs = fromSeed?.taxonomies?.[t.name] ?? [];
        // Categories follow the post's Category field when a term matches it (the owner may have
        // changed it, or written the post), and fall back to the seed's terms.
        if (t.name === 'category' && typeof row.category === 'string' && row.category) {
          const want = slugify(row.category);
          const term = (t.terms ?? []).find((x) => x.slug === want || x.label.toLowerCase() === row.category.toLowerCase());
          if (term) slugs = [term.slug];
        }
        for (const slug of slugs) {
          const term = await db.selectFrom('taxonomies').select(['id', 'translation_group']).where('name', '=', t.name).where('slug', '=', slug).executeTakeFirst();
          if (!term) continue;
          await db
            .insertInto('content_taxonomies')
            .values({ collection, entry_id: entryGroup, taxonomy_id: term.translation_group ?? term.id })
            .onConflict((oc) => oc.doNothing())
            .execute();
          summary.terms.push(`${collection}/${row.slug}: ${t.name}=${slug}`);
        }
      }

      if (fromSeed?.bylines?.length) {
        const has = await db.selectFrom('_emdash_content_bylines').select('id').where('collection_slug', '=', collection).where('content_id', '=', row.id).executeTakeFirst();
        if (has) continue;
        let order = 0;
        let first = null;
        for (const credit of fromSeed.bylines) {
          const ref = (seed.bylines ?? []).find((b) => b.id === credit.byline);
          const byline = ref && (await db.selectFrom('_emdash_bylines').select(['id', 'translation_group']).where('slug', '=', ref.slug).executeTakeFirst());
          if (!byline) continue;
          const group = byline.translation_group ?? byline.id;
          await db
            .insertInto('_emdash_content_bylines')
            .values({ id: ulid(), collection_slug: collection, content_id: row.id, byline_id: group, sort_order: order++, role_label: credit.roleLabel ?? null, created_at: new Date().toISOString() })
            .onConflict((oc) => oc.doNothing())
            .execute();
          first ??= group;
          summary.bylines.push(`${collection}/${row.slug}: ${credit.roleLabel ?? ''} ${ref.displayName}`.trim());
        }
        if (first && !row.primary_byline_id) {
          await sql`UPDATE ${sql.table(table)} SET primary_byline_id = ${first} WHERE id = ${row.id}`.execute(db);
        }
      }
    }
  }

  // 5. Full-text search for every seed collection that supports it.
  const fts = new FTSManager(db);
  summary.search = [];
  for (const c of seed.collections ?? []) {
    if (!c.supports?.includes('search')) continue;
    const config = await fts.getSearchConfig(c.slug);
    if (config?.enabled) summary.search.push(`${c.slug}: already on`);
    else if ((await fts.getSearchableFields(c.slug)).length) {
      await fts.enableSearch(c.slug);
      summary.search.push(`${c.slug}: enabled`);
    }
  }

  await db
    .insertInto('options')
    .values({ name: MARKER, value: JSON.stringify(new Date().toISOString()) })
    .onConflict((oc) => oc.column('name').doUpdateSet({ value: JSON.stringify(new Date().toISOString()) }))
    .execute();
} finally {
  await db.destroy();
}

console.log(JSON.stringify(summary, null, 2));

if (dryRun) {
  for (const ext of ['', '-wal', '-shm']) fs.rmSync(target + ext, { force: true });
  log('dry run: nothing was written to', dbPath);
} else if (restart) {
  // The running site caches collection settings and taxonomy definitions per process; restart it.
  let stopped = 0;
  for (const pid of fs.existsSync('/proc') ? fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d)) : []) {
    try {
      const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').join(' ');
      if (Number(pid) !== process.pid && /node .*dist\/server\/entry\.mjs/.test(cmd)) {
        process.kill(Number(pid), 'SIGTERM');
        stopped++;
      }
    } catch {
      // process gone or not ours
    }
  }
  log(stopped ? `stopped ${stopped} site process(es); scripts/start.sh restarts it in ~3 s` : 'no running site process found; restart it yourself');
} else {
  log('done. Restart the site process so it picks up the new settings.');
}
