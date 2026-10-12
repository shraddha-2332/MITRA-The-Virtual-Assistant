/**
 * Evidence-Grounded Verification and Safe Abstention Engine for Mitra.
 *
 * Validates generated assistant output against retrieved evidence to ensure
 * factual grounding (preventing hallucinated dates, fees, percentages, codes)
 * and classifies answer outcome statuses (ANSWERED, INSUFFICIENT_EVIDENCE,
 * CONFLICTING_EVIDENCE, OUTDATED_EVIDENCE, ESCALATED).
 */

import { availability } from './provenance.js';

// Normalize numeric string by stripping commas, currency symbols, and whitespace
export function normalizeNumber(token) {
  return String(token || '').replace(/[₹,$\s]/g, '').replace(/^inr/i, '').trim();
}

// Extract critical factual tokens (amounts, percentages, years, choice codes, dates)
export function extractFactualTokens(text) {
  const content = String(text || '');
  const tokens = {
    numbers: new Set(),
    percentages: new Set(),
    academicYears: new Set(),
    choiceCodes: new Set(),
    dates: new Set(),
  };

  // 1. Academic years (e.g. 2026-27, 2024-25)
  for (const match of content.matchAll(/\b(20\d{2}-\d{2})\b/g)) {
    tokens.academicYears.add(match[1]);
  }

  // 2. Choice codes (9 to 11 digit numbers) and institute code (06901)
  for (const match of content.matchAll(/\b(06901\d{4,6}[A-Za-z]?)\b/g)) {
    tokens.choiceCodes.add(match[1]);
  }

  // 3. Percentages (e.g. 45%, 40 percent)
  for (const match of content.matchAll(/(\d+(?:\.\d+)?)\s*(?:%|percent\b)/gi)) {
    tokens.percentages.add(match[1]);
  }

  // 4. Currency amounts and significant numbers (e.g. INR 1,05,000, 35,000, 98000)
  for (const match of content.matchAll(/(?:inr|rs\.?|₹)?\s*(\b\d{1,3}(?:,\d{2,3})+(?:\.\d+)?|\b\d{4,7}\b)/gi)) {
    const clean = normalizeNumber(match[1]);
    // Filter out calendar years (2020-2035) from pure fee numbers
    if (clean && !tokens.academicYears.has(clean)) {
      tokens.numbers.add(clean);
    }
  }

  // 5. Standard dates (e.g. 2026-06-30, 15 August 2026, 30 June)
  for (const match of content.matchAll(/\b(\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{4})?)\b/gi)) {
    tokens.dates.add(match[1].toLowerCase());
  }
  for (const match of content.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)) {
    tokens.dates.add(match[1]);
  }

  return tokens;
}

// Check for unauthorized promissory claims or commitments
export function detectUnauthorizedClaims(text) {
  const content = String(text || '').toLowerCase();
  const prohibitedPatterns = [
    /(?<!\b(?:not|cannot|does\s+not|do\s+not|did\s+not|will\s+not|no|never)\s+)guaranteed?\s+admission\b/,
    /\b100%\s+admission\b/,
    /(?<!\b(?:not|cannot|does\s+not|do\s+not|did\s+not|will\s+not|no|never)\s+)admission\s+is\s+confirmed\b/,
    /(?<!\b(?:not|cannot|does\s+not|do\s+not|did\s+not|will\s+not|no|never)\s+)seat\s+is\s+guaranteed\b/,
    /\b100%\s+placement\s+guaranteed\b/,
    /(?<!\b(?:not|cannot|does\s+not|do\s+not|did\s+not|will\s+not|no|never)\s+)job\s+is\s+guaranteed\b/,
    /\bfree\s+education\s+for\s+everyone\b/,
    /\b100%\s+fee\s+waiver\s+guaranteed\b/,
    /\bdeadline\s+extended\s+indefinitely\b/,
    /\bdirect\s+admission\s+without\s+merit\b/,
  ];

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(content)) {
      return { hasViolation: true, pattern: pattern.toString() };
    }
  }
  return { hasViolation: false };
}

// Extract all verified factual tokens from evidence records (text, structured facts, provenance)
export function extractEvidenceTokens(evidenceList) {
  const allTokens = {
    numbers: new Set(),
    percentages: new Set(),
    academicYears: new Set(),
    choiceCodes: new Set(),
    dates: new Set(),
  };

  const addTokens = (tokens) => {
    for (const item of tokens.numbers) allTokens.numbers.add(item);
    for (const item of tokens.percentages) allTokens.percentages.add(item);
    for (const item of tokens.academicYears) allTokens.academicYears.add(item);
    for (const item of tokens.choiceCodes) allTokens.choiceCodes.add(item);
    for (const item of tokens.dates) allTokens.dates.add(item);
  };

  for (const record of evidenceList || []) {
    if (typeof record.text === 'string') {
      addTokens(extractFactualTokens(record.text));
    }
    if (typeof record.title === 'string') {
      addTokens(extractFactualTokens(record.title));
    }
    // Also extract from structured facts if present
    if (record.facts && typeof record.facts === 'object') {
      if (record.facts.academicYear) allTokens.academicYears.add(record.facts.academicYear);
      const flattenNumbers = (obj) => {
        for (const val of Object.values(obj)) {
          if (typeof val === 'number') allTokens.numbers.add(String(val));
          else if (val && typeof val === 'object') flattenNumbers(val);
        }
      };
      flattenNumbers(record.facts);
      if (Array.isArray(record.facts.programs)) {
        for (const prog of record.facts.programs) {
          if (prog.choiceCode) allTokens.choiceCodes.add(prog.choiceCode);
          if (prog.intake) allTokens.numbers.add(String(prog.intake));
        }
      }
    }
    // Extract provenance metadata
    if (record.provenance && typeof record.provenance === 'object') {
      if (record.provenance.academicYear) allTokens.academicYears.add(record.provenance.academicYear);
      if (record.provenance.validFrom) allTokens.dates.add(record.provenance.validFrom);
      if (record.provenance.validUntil) allTokens.dates.add(record.provenance.validUntil);
    }
  }

  return allTokens;
}

/**
 * Validate generated answer text against supporting evidence records.
 * Ensures all factual numbers, percentages, years, dates, and codes in the output
 * are strictly grounded in official evidence, rejecting any hallucinated values.
 */
export function verifyGeneratedAnswer(generatedText, evidenceList) {
  if (typeof generatedText !== 'string' || !generatedText.trim()) {
    return { verified: false, status: 'EMPTY_GENERATION' };
  }
  if (generatedText.startsWith('INSUFFICIENT_EVIDENCE')) {
    return { verified: false, status: 'INSUFFICIENT_EVIDENCE' };
  }
  if (!Array.isArray(evidenceList) || evidenceList.length === 0) {
    return { verified: false, status: 'NO_EVIDENCE' };
  }

  // 1. Prohibited promissory claim detection
  const claimCheck = detectUnauthorizedClaims(generatedText);
  if (claimCheck.hasViolation) {
    return {
      verified: false,
      status: 'PROMISSORY_CLAIM_REJECTED',
      reason: `Generated answer violates promissory policy: ${claimCheck.pattern}`,
    };
  }

  // 2. Factual claim extraction
  const generatedTokens = extractFactualTokens(generatedText);
  const evidenceTokens = extractEvidenceTokens(evidenceList);

  const unsupported = [];

  // Check numbers
  for (const num of generatedTokens.numbers) {
    if (!evidenceTokens.numbers.has(num)) {
      unsupported.push({ type: 'number', value: num });
    }
  }

  // Check percentages
  for (const pct of generatedTokens.percentages) {
    if (!evidenceTokens.percentages.has(pct)) {
      unsupported.push({ type: 'percentage', value: `${pct}%` });
    }
  }

  // Check academic years
  for (const yr of generatedTokens.academicYears) {
    if (!evidenceTokens.academicYears.has(yr)) {
      unsupported.push({ type: 'academicYear', value: yr });
    }
  }

  // Check choice codes
  for (const code of generatedTokens.choiceCodes) {
    if (!evidenceTokens.choiceCodes.has(code)) {
      unsupported.push({ type: 'choiceCode', value: code });
    }
  }

  // Check dates
  for (const dt of generatedTokens.dates) {
    if (!evidenceTokens.dates.has(dt)) {
      unsupported.push({ type: 'date', value: dt });
    }
  }

  if (unsupported.length > 0) {
    return {
      verified: false,
      status: 'UNSUPPORTED_FACTUAL_CLAIMS',
      reason: 'Generated answer contains factual claims not present in retrieved official evidence',
      unsupported,
    };
  }

  return { verified: true, status: 'VERIFIED' };
}

/**
 * Classify the overall answer outcome according to defined trustworthiness categories:
 * - ANSWERED: Grounded, valid answer backed by available evidence
 * - INSUFFICIENT_EVIDENCE: Missing or weak evidence; question declined safely
 * - CONFLICTING_EVIDENCE: Authoritative sources disagree
 * - OUTDATED_EVIDENCE: Source expired, superseded, or not effective
 * - ESCALATED: Question requires direct human/department escalation
 */
export function classifyAnswerOutcome(answer, evidence, evaluationTime = Date.now()) {
  if (answer.conflict) {
    return 'CONFLICTING_EVIDENCE';
  }

  if (evidence && evidence.some((rec) => availability(rec, evaluationTime) !== 'available')) {
    return 'OUTDATED_EVIDENCE';
  }

  if (answer.actionView === 'inquiry' && (!evidence || evidence.length === 0)) {
    return answer.source === 'No verified record' ? 'INSUFFICIENT_EVIDENCE' : 'ESCALATED';
  }

  if (answer.source === 'No verified record' || (!evidence || evidence.length === 0 && !answer.clarification && !answer.anchored)) {
    return 'INSUFFICIENT_EVIDENCE';
  }

  if (answer.clarification) {
    return 'INSUFFICIENT_EVIDENCE';
  }

  return 'ANSWERED';
}
