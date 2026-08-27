/* eslint-disable no-console */
const path = require('path');
const sqlite3 = require('sqlite3');

const database = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '..', 'data', 'matzip.sqlite');
const db = new sqlite3.Database(database);

function all(sql) {
  return new Promise((resolve, reject) =>
    db.all(sql, (error, rows) => (error ? reject(error) : resolve(rows))),
  );
}

function run(sql, params) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, (error) => (error ? reject(error) : resolve())),
  );
}

async function translate(text, target) {
  const query = new URLSearchParams({ q: text, langpair: `ko|${target}` });
  const response = await fetch(
    `https://api.mymemory.translated.net/get?${query}`,
  );
  if (!response.ok) throw new Error(`Translation HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.responseStatus !== 200) {
    throw new Error(`Translation status ${payload.responseStatus}`);
  }
  return payload.responseData.translatedText.trim() || null;
}

async function backfill(table) {
  const rows = await all(
    `SELECT id, name FROM ${table} WHERE nameEn IS NULL OR nameJa IS NULL`,
  );
  for (const row of rows) {
    const [nameEn, nameJa] = await Promise.all([
      translate(row.name, 'en'),
      translate(row.name, 'ja'),
    ]);
    await run(`UPDATE ${table} SET nameEn = ?, nameJa = ? WHERE id = ?`, [
      nameEn,
      nameJa,
      row.id,
    ]);
  }
  console.log(`${table}: ${rows.length} localized`);
}

(async () => {
  try {
    await backfill('restaurant');
    await backfill('menu');
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
