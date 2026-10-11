import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const report = JSON.parse(fs.readFileSync(path.join(root, 'evaluation/reports/retrieval-latest.json'), 'utf8'));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
if (hash(JSON.stringify(report.corpus)) !== report.corpusSha256) throw new Error('Report corpus hash mismatch');
const folder = path.join(root, '../docs/retrieval-review');
fs.mkdirSync(folder, { recursive: true });
const targets = ['corpus.json', 'development-review.json', 'DEVELOPMENT_REVIEW.md'];
if (targets.some(name => fs.existsSync(path.join(folder, name)))) throw new Error('Review material already exists. Preserve completed reviews; use a separately versioned directory for another batch.');
const packet = {
  version: 1, status: 'pending-independent-review', split: 'development',
  corpusSha256: report.corpusSha256, originalCasesSha256: report.casesSha256,
  reviewer: { name: '', date: '', role: '', independentOfQuestionAuthoringAndRetrieverTuning: null },
  // Rankings, method names and existing expected labels deliberately omitted.
  cases: report.rows.map(row => ({ id: row.id, question: row.question, language: row.language,
    answerability: null, requiredFacets: [], acceptedEvidenceGroups: [], rationale: '',
    candidateJudgments: [...new Set([...Object.values(row.methods).flatMap(method => method.ids), ...row.evidenceGroups.flat()])].sort().map(recordId => ({ recordId, relevance: null, supportedFacet: '', rationale: '' })),
    additionalSupportingRecordIds: [], allCorpusRecordsConsidered: false, reviewed: false })),
};
fs.writeFileSync(path.join(folder, 'corpus.json'), `${JSON.stringify({ corpusSha256: report.corpusSha256, records: report.corpus }, null, 2)}\n`);
fs.writeFileSync(path.join(folder, 'development-review.json'), `${JSON.stringify(packet, null, 2)}\n`);
const records = new Map(report.corpus.map(record => [record.id, record]));
const md = ['# Independent development relevance review', '', 'Status: pending. Ranking order, method names and original expected labels are hidden. The pool combines records returned by all three methods with previously proposed evidence. Pool membership can still introduce selection bias: consult corpus.json for omitted alternatives.', '', 'Do not use prior scores to choose labels. Break each question into required facets. For each passage mark direct support / partial support / unrelated / wrong year. A passage mentioning a topic may still lack the requested fact. Separate supported, partially supported, unsupported and clarify-needed questions. Do not infer borrowing rules, transport routes, vacant seats or future fees from topic mentions.', '', 'Record reviewer name, date, competence and independence in development-review.json. All judgments start empty. Review all corpus records before claiming exhaustive relevance or precision. Existing diagnostics do not become independently reviewed merely by generating this file.', '', ...packet.cases.flatMap(item => [`## ${item.id}: ${item.question}`, '', `Language: ${item.language}`, '', ...item.candidateJudgments.flatMap(({ recordId }) => { const record = records.get(recordId); return [`### ${recordId}: ${record.title}`, '', `Source: ${record.source}`, '', record.text, '', 'Relevance / supported facet / rationale: __________', '']; }), 'Required facets: __________', '', 'Answerability and accepted record groups: __________', '', 'Additional supporting records from corpus.json: __________', ''])].join('\n');
fs.writeFileSync(path.join(folder, 'DEVELOPMENT_REVIEW.md'), `${md}\n`);
console.log(`Prepared ${packet.cases.length} blinded development cases and ${report.corpus.length} frozen corpus records. No review approval assigned.`);
