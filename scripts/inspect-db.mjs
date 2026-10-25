import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

for (const dbPath of ['./backend/data/mitra.sqlite', './backend/data/campusguard.sqlite']) {
  if (fs.existsSync(dbPath)) {
    console.log('=== Checking', dbPath, '===');
    const db = new DatabaseSync(dbPath);
    const row = db.prepare("SELECT data FROM collections WHERE name='app'").get();
    if (row && row.data) {
      const parsed = JSON.parse(row.data);
      console.log('Keys:', Object.keys(parsed));
      if (parsed.conversations) {
        console.log('Conversations count:', parsed.conversations.length);
        console.log('Conversations:', JSON.stringify(parsed.conversations, null, 2));
      }
      if (parsed.inquiries) {
        console.log('Inquiries count:', parsed.inquiries.length);
        console.log('Inquiries:', JSON.stringify(parsed.inquiries, null, 2));
      }
      if (parsed.auditLogs) {
        const askLogs = parsed.auditLogs.filter(a => a.action && a.action.includes('ask'));
        console.log('Ask auditLogs count:', askLogs.length);
        console.log('Ask logs:', JSON.stringify(askLogs, null, 2));
      }
    }
  }
}

