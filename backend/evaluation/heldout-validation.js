import crypto from 'node:crypto';

export function assertUnexposedCandidates(dataset, exposureLedger) {
  const hash = value => crypto.createHash('sha256').update(value).digest('hex');
  const exposed = new Set((exposureLedger?.cases || []).map(item => item.questionSha256));
  if (dataset.hasBeenEvaluated || dataset.records.some(item => exposed.has(hash(item.question)))) {
    throw new Error('Exposed questions are development diagnostics and cannot be claimed as held-out');
  }
}

export function validateHeldoutCandidate(dataset, corpus, developmentQuestions = []) {
  const corpusHash = crypto.createHash('sha256').update(JSON.stringify(corpus)).digest('hex');
  if (dataset.version !== 1 || dataset.split !== 'heldout-candidate' || dataset.reviewStatus !== 'unreviewed'
    || dataset.hasBeenEvaluated !== false || dataset.corpusSha256 !== corpusHash || !dataset.records?.length) {
    throw new Error('Expected unevaluated candidate questions bound to the frozen corpus');
  }
  const normalize = text => text.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, ' ').trim();
  const existing = new Set(developmentQuestions.map(normalize));
  const ids = new Set();
  for (const item of dataset.records) {
    if (!item.id || ids.has(item.id) || typeof item.question !== 'string' || !item.question.trim()
      || item.question.length > 1000 || !['en', 'mr', 'hi'].includes(item.language)
      || item.reviewed !== false || item.answerability !== null || !Array.isArray(item.evidenceGroups) || item.evidenceGroups.length) {
      throw new Error('Invalid or prematurely approved candidate case');
    }
    const question = normalize(item.question);
    if (existing.has(question)) throw new Error('Duplicate or development-contaminated candidate question');
    existing.add(question); ids.add(item.id);
  }
  return dataset;
}
