import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./backend/data/mitra.sqlite');
const row = db.prepare("SELECT data FROM collections WHERE name='app'").get();
const parsed = JSON.parse(row.data);
for (const k of parsed.knowledge) {
  if (k.text.includes('06901') || k.text.toLowerCase().includes('choice code') || k.text.toLowerCase().includes('intake') || k.facts?.programs) {
    console.log(`\n=== ID: ${k.id} | Source: ${k.source} ===`);
    console.log(k.text);
    if (k.facts) console.log('Facts:', JSON.stringify(k.facts));
  }
}

