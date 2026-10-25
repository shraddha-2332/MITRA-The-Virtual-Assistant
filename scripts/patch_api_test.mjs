import fs from 'fs';

const testFile = 'backend/test/api.test.js';
let content = fs.readFileSync(testFile, 'utf8');

const oldAssert = `      assert.equal(payload.data.escalation.reason, 'UNVERIFIED_INFORMATION');
      assert.ok(payload.data.escalation.helplines?.length > 0);`;

const newAssert = `      assert.equal(payload.data.escalation.reason, 'UNVERIFIED_INFORMATION');
      assert.equal(payload.data.escalation.email, 'office@mitcorer.edu.in');
      assert.equal(payload.data.escalation.actionLabel, 'Escalate to Administrative Office');
      assert.ok(payload.data.escalation.helplines?.length > 0);`;

const normContent = content.replace(/\r\n/g, '\n');
const normOld = oldAssert.replace(/\r\n/g, '\n');
const normNew = newAssert.replace(/\r\n/g, '\n');

if (!normContent.includes(normOld)) {
  console.error('Target assertion not found');
  process.exit(1);
}

const isCRLF = content.includes('\r\n');
const updated = normContent.replace(normOld, normNew);
fs.writeFileSync(testFile, isCRLF ? updated.replace(/\n/g, '\r\n') : updated, 'utf8');
console.log('Updated backend/test/api.test.js successfully');

