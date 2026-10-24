# Mitra research-paper context

**Project:** Mitra — an evidence-aware institutional virtual assistant for MITCORER Barshi  
**Project type:** Final-year Computer Science and Engineering project  
**Status at writing:** working prototype with automated regression evidence; independent human evaluation and deployment verification are pending.

This document provides safe, evidence-based material for the research paper. It separates implemented work from proposed research and must not be used to claim unmeasured accuracy, human language quality, production readiness or superiority over other systems.

## Suggested title

**MITRA: The Virtual Assistant**

## Abstract context

Mitra is a web-based virtual assistant designed to provide institution-specific admission and campus information for MIT College of Railway Engineering and Research (MITCORER), Barshi. Generic chatbots can produce fluent but unsupported responses, while static FAQ pages can be difficult to search when users use paraphrases, multiple questions, Hindi or Marathi. Mitra combines maintained institutional knowledge, deterministic rendering for critical facts, bounded multilingual query interpretation, source provenance controls, optional evidence-grounded generation and safe fallback behavior. The system uses React and Vite on the client, a Node.js backend, SQLite persistence, weighted rule/keyword retrieval, optional conceptual/vector retrieval, and optional Gemini-based generation. Current development validation includes backend, frontend, routing, public-answer and browser regression checks. The remaining research work is an independently reviewed benchmark comparing retrieval methods and evaluating correctness, completeness, evidence support, language quality, latency and cost.

## Problem statement

Students and parents need reliable answers about programmes, eligibility, fee structures, hostel, documents, scholarships, facilities, placements and admissions. Institutional information changes by academic year, admission route, category and gender. A direct general-purpose LLM answer can be inaccurate, outdated or overly confident. A keyword-only FAQ may fail when students use unfamiliar wording, spelling mistakes, compound questions or regional languages.

The research problem is therefore: **How can an institutional assistant retrieve maintained evidence, produce reliable factual answers, handle ambiguity and unsupported requests safely, and support selected multilingual queries without treating an LLM as the authority?**

## System objectives

1. Provide answers from maintained MITCORER knowledge and official links.
2. Render critical facts such as fees, intake, programme codes and accommodation charges deterministically.
3. Interpret selected English, Marathi, Hindi and transliterated queries.
4. Handle compound requests and ambiguity without silently omitting requested parts.
5. Preserve source/year/provenance information and refuse unavailable, retired, conflicting or unsupported facts.
6. Use Gemini only as optional evidence-grounded generation, never as the sole authority for critical institutional facts.
7. Measure retrieval and answer quality through a fair, independently reviewed evaluation.

## Architecture

```text
Student / parent
  -> React chat widget
  -> Node.js public-assistant API
  -> validation and query understanding
  -> maintained knowledge retrieval
  -> deterministic factual renderer or optional grounded Gemini generation
  -> factual-token and promissory-claim validation
  -> answer, clarification, refusal and relevant official links

Maintainer
  -> authenticated source/knowledge review
  -> revision-controlled SQLite knowledge store
  -> published records become eligible for public retrieval
```

## Implemented technical design

### Knowledge and facts

- SQLite stores application data and knowledge records.
- Seed data initializes only new databases; maintainer edits survive saving and restarting.
- Public retrieval accepts only `Published` records. Draft, Review, Archived and Retired records are excluded.
- Revision checks prevent stale maintainer updates.
- Canonical maintained records control academic fees, hostel/mess charges, current B.Tech programmes/intake and the historical seat matrix.
- Structured factual records validate years, amounts, programmes, intake and choice codes.

### Retrieval and query understanding

- Weighted keyword/rule retrieval is the primary retrieval method.
- A bounded parser extracts topic, programme, route, academic year, category, gender and facility scope.
- It supports selected plurals, paraphrases, spelling corrections, Hindi/Marathi conjunctions, negation and academic-year forms.
- Compound-question planning returns separate supported, unsupported or clarification sections.
- Conceptual synonym scoring is implemented for selected institutional paraphrases.
- Optional Gemini `text-embedding-004` vectors can be cached in SQLite and combined with lexical scores when a Gemini key is configured.
- BM25 tooling exists for comparison, but the production retriever has not been replaced based on unreviewed development tests.

### Optional generation and grounding

- Gemini is optional and receives only limited retrieved evidence.
- Direct maintained factual answers work without Gemini.
- Generated answers are checked for unsupported numeric amounts, academic years, dates, choice codes, percentages, intake values, phone numbers and salary/package values.
- Promissory statements such as guaranteed admission, placement, scholarship or seat allocation are rejected.
- This validation is useful but does not prove full sentence-level semantic entailment.

### Source freshness and website changes

- Sources can carry document/year/page/section/validity/review/supersession metadata.
- Unknown metadata remains unknown rather than being fabricated.
- A protected website-sync module checks selected MITCORER pages, extracts clean text, detects numeric/year/content drift and stages changes for review.
- Website synchronization never auto-publishes; a maintainer must review and publish the staged content.

### Multilingual behavior

- Interface language choices: Automatic, English, Marathi and Hindi.
- Maintained fee and intake tables have native rendering.
- Reviewed translations are content-hash-bound; stale or unavailable translation falls back explicitly to English.
- Formal competent-speaker approval for all Marathi/Hindi output remains pending.

## Current verification evidence

The following are development/regression checks, not independent answer-accuracy results:

| Check | Latest result |
| --- | ---: |
| Backend tests | 146/146 passed on 23 October 2026 |
| Frontend tests | 15/15 passed on 23 October 2026 |
| Legacy routing/content diagnostics | 500/500 passed |
| Public diagnostic cases | 18/18 passed |
| Developer paraphrase diagnostics | 24/24 passed |
| Language browser journeys | 14 passed |
| Full browser answer audit | 426/426 real API journeys passed |
| Emitted external source-link reachability audit | 30/30 reachable on audit date |

These checks verify defined expected behavior. They do not establish general accuracy, generalization, human language quality, source correctness or live deployment performance.

## Current limitations

1. Keyword/rule and conceptual retrieval can miss unfamiliar wording or complex requests.
2. The semantic/vector feature has not been independently compared against the baseline on a held-out corpus.
3. Token-level grounding does not prove that every generated sentence is semantically supported.
4. The 24 paraphrase cases are exposed development material and cannot be used as the final test set.
5. Independent reviewer relevance judgments, factual judgments and speaker approval are pending.
6. Public chat has no multi-turn context; authenticated users have a separate private conversation-history feature.
7. SQLite and in-memory rate limiting are appropriate for a small academic prototype, not unmodified horizontal scaling.
8. Deployment, HTTPS, production cookies, monitoring, backup/restore testing, load testing and real model-cost measurement are pending.

## Research methodology to complete

1. Freeze a corpus snapshot with its source versions and academic-year metadata.
2. Ask independent faculty/domain reviewers to author fresh questions in English, Marathi, Hindi and mixed language.
3. Keep final questions separate from development/tuning questions.
4. Annotate expected evidence, required claims, prohibited claims, answerability and clarification requirements.
5. Compare under identical conditions:
   - baseline weighted keyword/rule retrieval;
   - BM25;
   - conceptual semantic retrieval;
   - optional vector/hybrid retrieval only if Gemini cost and availability are acceptable.
6. Measure Recall@K, MRR, answer correctness, answer completeness, citation/evidence support, refusal quality, clarification quality, multilingual quality, p50/p95 latency, model-call count, token usage and cost.
7. Report failures and disagreements. Do not publish only aggregate positive metrics.

## Planned Gemini reliability policy

Mitra currently uses one Gemini API key and one configured generation model. It has deterministic fallback if Gemini fails, but not model cascading.

Planned safe chain:

```text
Deterministic maintained answer
  -> primary Gemini model
  -> one bounded retry for timeout / 408 / 429 / temporary 5xx
  -> fallback Gemini model
  -> evidence-based fallback or insufficient-information response
```

Gemini quotas are applied per project, not per API key. Multiple keys from the same project are not a valid quota-scaling strategy. A fallback key should be used only for controlled key rotation or separately authorized backup-project recovery. All fallback-model output must pass the same grounding checks. This is planned work, not an implemented or benchmarked result.

## Safe claims for the paper

The paper may state that Mitra implements maintained knowledge, deterministic factual answers, bounded multilingual interpretation, source provenance, controlled clarification/refusal behavior, optional Gemini generation, optional semantic/vector retrieval support, website-change staging and automated regression testing.

The paper must not state that Mitra is production-ready, has a measured overall accuracy, is superior to BM25 or semantic retrieval, has fully human-approved Marathi/Hindi fluency, or provides complete semantic claim verification until those are independently measured.
