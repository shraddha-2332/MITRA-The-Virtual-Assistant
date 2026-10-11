// Automated contract checks are proxies, not factual or translation-quality judgments.
export function validateDataset(dataset, knowledge) {
  if (dataset.version !== 1 || dataset.split !== 'development' || dataset.reviewStatus !== 'unreviewed') {
    throw new Error('Expected a version-1, unreviewed development dataset. Held-out evaluation requires a separate review workflow.');
  }
  if (!Array.isArray(dataset.records) || !dataset.records.length) throw new Error('Dataset has no records.');
  const ids = new Set();
  const evidenceIds = new Set(knowledge.filter((item) => item.status === 'Published').map((item) => item.id));
  for (const item of dataset.records) {
    if (typeof item.id !== 'string' || !item.id || ids.has(item.id)) throw new Error('Missing or duplicate case ID.');
    ids.add(item.id);
    if (typeof item.question !== 'string' || !['en', 'mr', 'hi', 'mixed'].includes(item.language)
      || typeof item.category !== 'string' || !item.category
      || !['supported', 'unsupported', 'clarify', 'invalid'].includes(item.answerability)
      || !Number.isInteger(item.expectedStatus) || item.expectedStatus < 100 || item.expectedStatus > 599) {
      throw new Error(`Invalid case contract: ${item.id}`);
    }
    for (const field of ['evidenceGroups', 'claimGroups', 'behaviorGroups']) {
      if (!Array.isArray(item[field]) || item[field].some((group) => !Array.isArray(group) || !group.length
        || group.some((value) => typeof value !== 'string' || !value.trim()))) throw new Error(`Invalid ${field}: ${item.id}`);
    }
    if (!Array.isArray(item.forbiddenPhrases) || item.forbiddenPhrases.some((value) => typeof value !== 'string' || !value.trim())
      || typeof item.expectNoEvidence !== 'boolean' || typeof item.expectDevanagari !== 'boolean') {
      throw new Error(`Invalid checks: ${item.id}`);
    }
    if (item.evidenceGroups.some((group) => group.some((id) => !evidenceIds.has(id)))) throw new Error(`Unknown published evidence ID: ${item.id}`);
    if (item.answerability === 'supported' && (!item.evidenceGroups.length || !item.claimGroups.length)) throw new Error(`Supported case needs evidence and claims: ${item.id}`);
    if (['unsupported', 'clarify'].includes(item.answerability) && !item.behaviorGroups.length) throw new Error(`Case needs expected refusal/clarification behavior: ${item.id}`);
  }
  return dataset;
}

const normalize = (value) => String(value || '').normalize('NFKC').toLowerCase();
const fraction = (matched, total) => total ? matched / total : null;

export function scoreResponse(item, status, payload) {
  const data = payload?.data;
  const answer = typeof data?.answer === 'string' ? data.answer : '';
  const text = normalize(answer);
  const evidenceIds = Array.isArray(data?.evidence) ? data.evidence.map((record) => record.id) : [];
  const groups = (values) => values.map((group) => group.some((phrase) => text.includes(normalize(phrase))));
  const claimMatches = groups(item.claimGroups);
  const behaviorMatches = groups(item.behaviorGroups);
  const evidenceMatches = item.evidenceGroups.map((group) => group.some((id) => evidenceIds.includes(id)));
  const ranks = item.evidenceGroups.map((group) => evidenceIds.findIndex((id) => group.includes(id)));
  const forbiddenMatches = item.forbiddenPhrases.filter((phrase) => text.includes(normalize(phrase)));
  // Script coverage cannot distinguish Hindi from Marathi or measure fluency.
  const scriptPass = !item.expectDevanagari || (answer.match(/[\u0900-\u097F]/gu) || []).length >= 12;
  const failures = [];
  if (status !== item.expectedStatus) failures.push('http_status');
  if (item.expectedStatus === 200 && (!data || !answer.trim() || !Array.isArray(data.evidence))) failures.push('response_contract');
  if (item.expectedStatus >= 400 && (typeof payload?.error?.code !== 'string' || typeof payload?.error?.message !== 'string')) failures.push('error_contract');
  if (evidenceMatches.includes(false)) failures.push('required_evidence');
  if (claimMatches.includes(false)) failures.push('required_claim_text');
  if (behaviorMatches.includes(false)) failures.push('required_behavior_text');
  if (forbiddenMatches.length) failures.push('forbidden_text');
  if (item.expectNoEvidence && evidenceIds.length) failures.push('unexpected_evidence');
  if (!scriptPass) failures.push('requested_script');
  return {
    passed: failures.length === 0, failures, answer, evidenceIds,
    evidenceGroupRecall: fraction(evidenceMatches.filter(Boolean).length, evidenceMatches.length),
    evidenceGroupMeanReciprocalRank: ranks.length ? ranks.reduce((sum, rank) => sum + (rank < 0 ? 0 : 1 / (rank + 1)), 0) / ranks.length : null,
    claimTextCoverage: fraction(claimMatches.filter(Boolean).length, claimMatches.length),
    missingClaimGroups: item.claimGroups.filter((_, index) => !claimMatches[index]),
    missingEvidenceGroups: item.evidenceGroups.filter((_, index) => !evidenceMatches[index]),
    forbiddenMatches, scriptPass,
  };
}

const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
export function summarizeResults(results) {
  if (!results.length) throw new Error('Cannot summarize an empty run.');
  const measured = (field) => {
    const values = results.map((row) => row[field]).filter((value) => Number.isFinite(value));
    return { count: values.length, mean: mean(values) };
  };
  const breakdown = (field) => Object.fromEntries([...new Set(results.map((row) => row[field]))].map((key) => {
    const rows = results.filter((row) => row[field] === key);
    return [key, { total: rows.length, passed: rows.filter((row) => row.passed).length }];
  }));
  const timings = results.map((row) => row.latencyMs).filter(Number.isFinite).sort((a, b) => a - b);
  const percentile = (p) => timings.length ? timings[Math.ceil(p * timings.length) - 1] : null;
  return {
    total: results.length, passed: results.filter((row) => row.passed).length,
    failed: results.filter((row) => !row.passed).length,
    byLanguage: breakdown('language'), byCategory: breakdown('category'), byAnswerability: breakdown('answerability'),
    evidenceGroupRecall: measured('evidenceGroupRecall'), evidenceGroupMeanReciprocalRank: measured('evidenceGroupMeanReciprocalRank'),
    claimTextCoverage: measured('claimTextCoverage'),
    localLatencyMs: { count: timings.length, p50: percentile(0.5), p95: percentile(0.95) },
  };
}
