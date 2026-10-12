import { loadDb, getDb, saveDb } from '../src/store.js';
import { syncMonitoredWebsiteSources } from '../src/website-sync.js';

loadDb();
const db = getDb();

console.log('Checking monitored MITCORER website pages for updates...');
const summary = await syncMonitoredWebsiteSources({
  db,
  saveFn: saveDb,
});

console.log('\n========================================');
console.log('MITRA College Website Sync Summary');
console.log('========================================');
console.log(`Pages checked: ${summary.checked}`);
console.log(`Changed / Staged for review: ${summary.changed}`);
console.log(`Unchanged: ${summary.unchanged}`);
if (summary.errors.length > 0) {
  console.log(`\nErrors encountered (${summary.errors.length}):`);
  summary.errors.forEach((e) => console.log(` - ${e.url}: ${e.error}`));
}
if (summary.stagedSources.length > 0) {
  console.log(`\nStaged sources pending maintainer review:`);
  summary.stagedSources.forEach((s) => console.log(` - [${s.id}] ${s.title} (${s.sourceUrl})`));
}
console.log('========================================\n');

