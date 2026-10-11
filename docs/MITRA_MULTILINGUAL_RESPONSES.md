# Marathi and Hindi response support

Implemented: 9 October 2026.

## Assessment and plan

Previously, familiar Marathi/Hindi phrases could route to English records, but answers commonly stayed in English. The public evaluator's three language cases failed requested-script checks. This increment adds explicit language selection, deterministic factual rendering and maintained translations while keeping unsupported translation visible.

No new dependency, paid translation service, database reset or automatic knowledge overwrite is introduced.

## Implementation

UI update: the response-language row has been replaced by a compact Languages icon beside minimize in the chat header. A native selector retains all four options, an accessible name, keyboard operation and a small selected-language badge. It occupies no extra row above the composer. Public maintainer sign-in was removed at the user's request; the original footer is restored.

The public chat offers **Automatic**, **English**, **मराठी** and **हिंदी**. Explicit choice overrides inferred language. Automatic selection recognizes common requests and distinctive Marathi/Hindi words; shared Devanagari script alone does not imply Hindi. Romanized/mixed questions without clear language instructions default to English. The composer placeholder, loading announcement, send label and request-failure messages follow an explicitly selected language; remaining navigation, quick replies and institutional source labels can remain English.

Common native-language topic terms and Devanagari digits are normalized before existing routing. Marathi/Hindi conjunctions can reach the bounded compound planner. Historical seat-matrix wording is distinguished from current intake wording.

Academic fee tables, hostel/mess charges and B.Tech intake use native templates populated from maintained structured facts. Category/route selection is shared with the English renderer. Amounts, academic years, choice codes and official programme names are retained; names are not independently retranslated. Annual-payment uncertainty, refundable deposits, room-availability caveats and the absence of an admission guarantee are preserved in the templates.

The original cloned database may still contain plain text for these records. A read-only adapter recognizes the original fee, hostel and programme-table formats, extracts their current values and checks their schema and totals. It does not copy values from the seed into maintained records. Unknown wording or extra conditions cause an explicit English fallback. Legacy translation renders the complete recognized record rather than pretending to have a more precise structured query result. Regression tests read the preserved original corpus to verify this compatibility.

Native clarification and unsupported-information responses are also provided. Compound responses retain numbered references, supporting record IDs and per-section localization status. When only some sections can be translated, the answer identifies fallback content instead of pretending the whole answer is translated.

## Reviewed free-text translations

Administrators can add Marathi/Hindi text in **Knowledge → Edit record**, then explicitly confirm reviewing it against the current source. The confirmation resets when source or translation text changes. No human review is inferred from text supplied by the assistant itself.

API creation/editing accepts `translations: { "mr": "reviewed text", "hi": "reviewed text" }`; a locale value of `null` removes it. Locale keys other than mr/hi, spoofed review metadata, oversized/empty text, missing Devanagari and changed numeric tokens are rejected. The server stamps reviewer identity/time and a SHA-256 hash of the current source text. Changes to that text make the stored translation ineligible until deliberately reviewed again. This content hash is not a signature or semantic correctness proof.

Library, transport and hostel-facility questions can use a current reviewed passage directly. Other free-text translations are used only when the English answer exactly matches their source passage. Translations are never applied blindly to a different prepared answer.

Without a current translation or suitable factual template, the response includes a native notice followed by the original English text. `responseLanguage` is then `mixed`, and `localizationStatus` is `fallback` or `partial`. Unsupported information is not fabricated to obtain native-script output. Gemini generation is disabled for non-English response requests until separately evaluated output validation is available; ordinary English generation behavior remains.

## API and provenance

Question bodies on public, authenticated and account-history endpoints accept optional `language`: `auto` (default), `en`, `mr`, `hi`. Unsupported preferences return a structured 400 error.

Responses include `requestedLanguage`, `responseLanguage`, and `localizationStatus` (`original`, `template`, `maintainer-reviewed`, `fallback`, `partial`). Native results also describe `languageReviewStatus`: templates require speaker review, reviewed records identify the maintainer-review workflow, and unavailable translations are explicit. Account history persists this metadata.

Numeric checks normalize Devanagari digits, retain decimals/years/leading-zero codes, and compare token sets. They detect changed or omitted numeric values, but do not prove semantic field bindings or translation quality. Deterministic templates use the shared validated fields; free-text meaning and conditions still need human review.

## Validation and result

Final backend regression suite: **88/88 passed**. Existing legacy evaluator: **500/500 passed**. Public development evaluator: **18/18 passed**, including strict-mode success. Frontend lint, production build and **3/3** formatting tests passed.

Coverage includes explicit preference, conservative inference, current intake/historical wording, Devanagari digits, category-specific fees, years/codes/names, uncertainty text, native compound references, ambiguity, reviewed-translation persistence/staleness, original cloned records, English override, history metadata and zero Gemini calls for non-English requests. Original baseline artifacts and diagnostic questions are unchanged.

These are unreviewed developer diagnostics. Native-script presence is not a translation-quality metric, and 18/18 is not overall answer accuracy. Subsequent real Chrome verification covers 14 Marathi/Hindi journeys and exposed a frontend substitution bug that is now fixed. See [language verification and review material](LANGUAGE_VERIFICATION.md). Competent-speaker evaluation remains pending.

## Known limitations

Templates are developer-authored and marked **speaker-review-pending**. General prose is not automatically translated. Full knowledge coverage requires maintained translations reviewed by competent speakers. Automatic language/topic detection remains rule-based; unusual wording, mixed-language ambiguity and complex conjunctions can fail. Proper names and source metadata remain in their authoritative spelling. Planner screens and much of the surrounding interface remain English.

The numeric guard cannot detect negation changes, swapped semantic roles or omitted nonnumeric conditions. Reviewers should independently check those aspects. Review stamps identify an authenticated maintainer action; they do not establish that the reviewer is fluent or that the source itself is current.

## Next step

Have competent Marathi/Hindi speakers review the generated packet, recording factual correctness, conditions, fluency and terminology separately. The user subsequently accepted current behavior and authorized moving forward while monitoring problems. See the [completed development BM25 comparison](MITRA_BM25_COMPARISON.md); formal speaker approval remains unverified.
