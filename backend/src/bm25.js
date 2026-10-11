// Offline lexical baseline; not selected by the production answering pipeline.
import { usableKnowledge } from './provenance.js';
export function lexicalTokens(text) {
  return String(text || '').normalize('NFKC').toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) || [];
}

export function createBm25(records, { k1 = 1.2, b = 0.75 } = {}) {
  if (!Number.isFinite(k1) || k1 <= 0 || !Number.isFinite(b) || b < 0 || b > 1) throw new Error('Invalid BM25 parameters');
  const documents = records.filter(usableKnowledge).map(record => {
    const tokens = lexicalTokens([record.title, record.category, ...(record.tags || []), record.text].join(' '));
    const frequencies = new Map();
    for (const token of tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1);
    return { record, length: tokens.length, frequencies };
  });
  const frequency = new Map();
  for (const document of documents) for (const token of document.frequencies.keys()) frequency.set(token, (frequency.get(token) || 0) + 1);
  const averageLength = documents.reduce((sum, document) => sum + document.length, 0) / (documents.length || 1) || 1;
  return question => {
    const query = new Set(lexicalTokens(question));
    return documents.map(({ record, length, frequencies }) => {
      let score = 0;
      for (const term of query) {
        const tf = frequencies.get(term) || 0;
        if (!tf) continue;
        const df = frequency.get(term);
        const idf = Math.log(1 + (documents.length - df + 0.5) / (df + 0.5));
        score += idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * length / averageLength));
      }
      return { ...record, score };
    }).filter(record => record.score > 0 && usableKnowledge(record)).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 3);
  };
}
