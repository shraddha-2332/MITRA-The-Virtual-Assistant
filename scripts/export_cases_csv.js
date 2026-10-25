import fs from 'fs';

const cases = JSON.parse(fs.readFileSync('backend/evaluation/pilot-dataset-90.json', 'utf8'));

const headers = [
  'case_id',
  'language',
  'topic',
  'question',
  'reference_answerability',
  'reference_expected_decision',
  'required_facts',
  'source_page_or_record_id'
];

const rows = cases.map(c => {
  const q = `"${(c.question || '').replace(/"/g, '""')}"`;
  const facts = `"${(c.requiredFacts || []).join('; ').replace(/"/g, '""')}"`;
  return [
    c.id,
    c.language,
    c.domain,
    q,
    c.answerability,
    c.expectedOutcome,
    facts,
    c.expectedSourceId || ''
  ].join(',');
});

const csvContent = [headers.join(','), ...rows].join('\n');
fs.writeFileSync('deliverables/evaluation-record-kit/cases.csv', csvContent, 'utf8');
console.log(`Successfully populated deliverables/evaluation-record-kit/cases.csv with ${cases.length} cases.`);

