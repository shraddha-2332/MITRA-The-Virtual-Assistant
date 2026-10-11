# Compound answers and clarification

Implemented: 9 October 2026.

## Assessment and plan

The assistant previously selected the first matching topic and could omit a second requested topic. A bare “What is its intake?” defaulted to a programme record despite having no conversation context. The public development diagnostics exposed both behaviors.

This increment uses a bounded deterministic planner before ordinary single-topic routing. No new model, dependency or session store is introduced. Existing authenticated admission-progress and document-status handling retains priority.

## Implementation

`backend/src/question-plan.js` recognizes up to four requested parts separated by common English conjunctions, question/semicolon boundaries or sentence boundaries before a new question verb. It protects common programme names containing “and” and keeps hostel/mess costs and same-topic qualifiers together. Background statements about category or admission are treated as context rather than independent questions.

Supported facets: first-year B.Tech programmes/intake, academic fees, hostel/mess fees, historical seat matrix, hostel facilities, transport and library information. The planner uses the maintained fee/intake renderers or an explicitly selected published passage for facility facts. Unknown parts are explicitly unsupported; they are not sent to Gemini to fill gaps. Questions outside these recognized patterns retain the existing routing path.

A single unambiguous year and admission route can apply to another part of the same question. Explicit years/routes within a clause take precedence; distinct first-year/DSE fee requests are answered independently. Ambiguous programme references ask for clarification. A CSE reference explicitly provided within the same compound question can resolve its intake part; an earlier separate request cannot.

Each compound response contains `sections` with topic, title, clause question, answer, status (`supported`, `unsupported`, `clarification`) and supporting evidence IDs. Supporting records are deduplicated in `evidence`. Numbered references in the answer map to that array and to numbered source labels. Available official links use the existing `{ label, url }` frontend contract. Records without a URL still appear in the source summary; no source link is invented. Account history retains sections/evidence for reopening. Public chat remains stateless.

Retired, absent or wrong-year records cannot support a compound section. Another supported section remains available. A request exceeding four interpreted topics receives a clarification response rather than silently losing parts.

## Examples

- Courses plus Open fees: separate programme and academic fee sections with their own records.
- Hostel facilities plus bus facilities: independent facility passages and links.
- Library plus today's canteen menu: library information followed by an explicit unsupported section.
- “What is its intake?”: asks which programme and route, with no attached evidence or guessed intake.

## Validation

Final checks: **75/75 backend tests**, **500/500 legacy benchmark**, backend syntax check and **3/3 frontend formatting tests** passed. Public development checks improved from **12/18 to 15/18**. The three remaining failures are Marathi/Hindi response-script checks; they are not a translation-quality measurement. No application database reset or GitHub push was performed.

Regression coverage includes HTTP responses, per-section citations, unknown/retired parts, missing years, background qualifiers, programme names containing “and”, same-topic qualifiers, bounded topic count, separate fee routes, session independence and account-history preservation. Original diagnostic questions and baseline archives are unchanged.

Results and research limitations are recorded in `MITRA_PUBLIC_EVALUATION.md`. These developer-authored checks do not establish general multi-intent understanding, citation entailment or held-out answer accuracy.

## Known limitations and next step

Interpretation remains rule-based and limited to the listed facets and English clause separators. It can miss unusual wording and multilingual conjunctions. Unknown single-topic questions still use the existing routing behavior. Full conversation context, multilingual answers, PDF page-level citations and semantic claim validation remain outstanding. There was no browser E2E run in this increment; frontend source was unchanged.

Next: complete Marathi/Hindi response behavior, then compare retrieval approaches against independently reviewed questions. Keep language quality separate from factual correctness.
