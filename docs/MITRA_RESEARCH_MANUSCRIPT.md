# MITRA: Evidence-Aware Multilingual Conversational AI for Institutional Information Assistance

**Shraddha Sunil Ukirade¹**, **Anzalna Ayaz Tamboli²**, **Sayali Santosh Kakade³**, **Dnyaneshwari Satyavan Vyavahare⁴**, **Prof. Shobhana Raichurkar⁵**  
¹˒²˒³˒⁴Department of Computer Science & Engineering, MIT College of Railway Engineering & Research, Barshi, Maharashtra, India  
⁵Assistant Professor, Department of Computer Science & Engineering, MIT College of Railway Engineering & Research, Barshi, Maharashtra, India  
*Affiliated to Punyashlok Ahilyadevi Holkar Solapur University (PAHSU), Solapur, Maharashtra, India*

---

### Abstract
University admissions assistance requires answers that preserve the academic year, admission route and applicant attributes attached to each fact. This paper presents MITRA, an assistant for MIT College of Railway Engineering & Research, Barshi, that supports English, Marathi and Hindi through maintained knowledge, structured factual rendering and optional evidence-conditioned generation. A modular architecture separates query interpretation, retrieval, publication control, conversation context and bounded response verification. Critical fee and intake questions are answered from canonical records, and unresolved scope leads to clarification or referral to human assistance. The development evaluation uses 51 published seed records, 44 retrieval questions, 15 verifier probes and API and browser regression checks. The application retriever reaches a group Recall@3 of 1.000 on developer-authored relevance groups. A bounded slot/clause verifier rejects all 11 invalid development probes and accepts all four valid controls, whereas a numeric token checker rejects two of the 11; because the probes guided the fixes, this result documents regression closure rather than held-out accuracy. In a small descriptive Authority-evaluated live pilot of 30 questions (10 English, 10 Marathi, 10 Hindi), 26 answers (86.67%) were judged correct and four questions (13.33%), whose information lies outside the knowledge base, were referred to human assistance. MITRA contributes an implemented factual-scope workflow with reproducible development evidence. Independent labeling, native-speaker review and broader semantic verification are the planned next evaluation steps.

**Index Terms**— University admissions, institutional question answering, multilingual assistance, structured knowledge, factual verification, retrieval evaluation.

---

## I. INTRODUCTION

Applicants and parents must locate information scattered across fee circulars, programme lists, institutional pages and administrative notices. A short question may omit details that change the correct answer: the same category label can carry different charges for first-year and direct second-year entry, and hostel, deposit and mess figures can mislead when attached to the wrong labels. Source relevance and numerical overlap are therefore necessary but not sufficient for a correctly scoped response. General-purpose language models add a further risk, since they can produce fluent statements that no source supports, and a transposed fee or wrong year can affect a family’s financial decisions.

MITRA serves MIT College of Railway Engineering & Research, Barshi. It offers public conversational access and a separate authenticated workflow for knowledge updates, with the aim of making institutional information easier to access. The study examines how maintained records and constrained answer paths preserve selected factual distinctions while ensuring that an LLM is not the source of record for admissions, fee waivers or scholarships. Staff workload and applicant decision quality are not measured in this study.

The contribution is an engineering case study with three components: a maintained knowledge lifecycle, a multilingual scope-sensitive answer workflow, and source-bound development diagnostics for retrieval and selected attribution failures, complemented by a small Authority-evaluated live pilot. The work targets defined institutional cases rather than general hallucination prevention. Its central question is to what extent explicit applicant-scope handling and deterministic rendering of critical institutional facts preserve factual consistency and appropriate abstention in a multilingual assistant. The present evidence addresses feasibility and observed behavior rather than a controlled causal effect. Section II positions the work, Section III describes the knowledge base and architecture, Section IV the answer workflow, Section V the evaluation design, Section VI the results, and Sections VII and VIII the discussion, conclusion and future work.

---

## II. RELATED WORK AND RESEARCH POSITION

Retrieval-augmented generation (RAG) combines retrieved knowledge with language generation [1]. MITRA applies evidence-conditioned generation as an optional path rather than the jointly trained architecture of that work. BM25 provides an established lexical ranking framework [2]; the comparison here therefore includes raw and normalized BM25 as a lexical experiment, separate from a full RAG benchmark.

Closely related admissions systems exist. URAG places FAQ answering before document-based generation [3], and an IEEE study combines intent filtering with admissions RAG [4]. Because fact retrieval, topic routing and document maintenance are established practices, MITRA’s contribution lies in documenting how selected fee attributes, record availability, follow-up scope and unsupported questions are handled in one maintained implementation.

MARAUS reports a multi-agent admissions application [5], whereas MITRA uses a single backend; this difference is architectural and implies no difference in accuracy. Academic RAG with conversation history is also established [6]. IndicNLPSuite provides Indian-language resources and benchmarks [7]; MITRA uses its own rules and source-bound translations, so those benchmark scores do not transfer, and quality across its three interface languages requires separate evaluation.

RAGAs evaluates generated assertions against context [8], which differs from a numeric token-presence check. MATSA addresses fine-grained table structure attribution [9], and TabFaith studies structural faithfulness in table summarization [10]. MITRA’s mutation probes serve as a small application-specific diagnostic in this area.

Broader background frames the design. Unsupported generation is documented across natural language generation tasks [11], which is why critical values are kept on a deterministic path. BEIR reports BM25 as a robust zero-shot baseline [12], which motivates the lexical comparison in Section V. TyDi QA and XOR QA show the difficulty of cross-lingual and low-resource question answering [13], [14]. Provenance research distinguishes why- and where-provenance [15], supporting the retention of source and academic-year metadata with each record. These sources provide context rather than measured baselines.

Table I relates prior work to the present implementation. No external system was rerun on MITRA’s corpus, so the table implies no performance ranking.

### TABLE I: LITERATURE REVIEW AND THE BOUNDED POSITION OF THIS STUDY

| Ref. / Year | Methodology | Key finding | Limitation relative to this study |
| :--- | :--- | :--- | :--- |
| **[1] 2020** | Retrieval-augmented generation | Retrieved knowledge conditions language generation | Jointly trained architecture; MITRA uses optional evidence-conditioned generation |
| **[2] 2009** | BM25 probabilistic relevance framework | Established lexical ranking baseline | Lexical ranking only; MITRA adds applicant-scope handling |
| **[3] 2025** | Hybrid RAG for university admissions | FAQ answering placed before document-based generation | Different institution and dataset; not rerun on MITRA’s corpus |
| **[4] 2024** | Intent-filtered admissions RAG | Intent filtering combined with admissions RAG | Different institution and protocol; not rerun here |
| **[5] 2025** | Multi-agent admissions application | Multi-agent RAG applied to admissions counseling | Single-backend MITRA not compared; no ranking inferred |
| **[6] 2024** | RAG with conversation history | Academic RAG that carries conversation history | Architectural comparison only; accuracy not compared |
| **[7] 2020** | Indian-language resources and benchmarks | Corpora and benchmarks for Indian languages | MITRA uses its own rules and source-bound translations |
| **[8] 2024** | Assertion-level RAG evaluation | Generated assertions checked against context | Assertion-level evaluation; differs from MITRA’s numeric and slot checks |
| **[9] 2024** | Table structure attribution | Fine-grained attribution of table structure | Table-attribution task, separate from MITRA’s probes |
| **[10] 2026** | Table-summarization faithfulness | Structural faithfulness in table summaries | Table-summarization task, separate from MITRA’s probes |
| **[11] 2023** | Survey of hallucination in NLG | Taxonomy of intrinsic and extrinsic unsupported content | Survey; no institutional mitigation |
| **[12] 2021** | BEIR zero-shot retrieval benchmark | BM25 is robust across heterogeneous domains | Corpora differ from a small institutional corpus |
| **[13], [14] 2020–21** | TyDi QA; XOR QA | Cross-lingual and low-resource QA is difficult | General benchmarks; no admissions data |
| **[15] 2001** | Why- and where-provenance | Formal characterization of data provenance | Database theory; not a chatbot design |
| **[16] 2024** | RAG admissions chatbot (GPT-3.5 with LlamaIndex) | Applied to admission data from three universities; feedback from 53 high-school students | Different institutions and protocol; not rerun on MITRA’s corpus |

MITRA’s research position is deliberately focused: it shows how these concerns interact in a working institutional prototype and makes selected failures reproducible. Admissions studies that evaluate with real users, such as MARAUS [5], which processed over 6,000 user interactions, and Chen et al. [16], who collected feedback from 53 high-school students, rest on broader user evidence than MITRA’s 30-question pilot, and MITRA claims no accuracy advantage over them. A comparative study should next isolate the effect of structured rendering and scope checks using independently authored questions on the same frozen corpus.

---

## III. INSTITUTIONAL KNOWLEDGE AND SYSTEM ARCHITECTURE

### 3.1 Knowledge Representation and Maintenance
The development corpus contains 51 published seed records covering institutional topics. Records may include structured facts, source links, publication status, revision information and validity metadata. The seeded corpus is separate from the maintained live database, and each experiment identifies the snapshot it uses. Structured academic-fee records distinguish entry route and applicant attributes, and accommodation records distinguish hostel, refundable deposit and annual mess amounts. Programme records supply maintained intake values in place of a model-generated programme list.

Source material (PDF, scanned documents, TXT and CSV) is processed with Poppler text extraction and English Tesseract OCR, structured into records with source metadata, academic year and content hashes, reviewed by a maintainer and then published. Because the OCR configuration is English-only, scanned Marathi or Hindi (Devanagari) documents enter the knowledge base through an alternative route.

Knowledge changes pass through authenticated maintenance endpoints. Validation checks record structure and selected numeric and year fields, and revision checks reject stale edits so that two maintainers cannot silently overwrite each other. A record moves from draft to review to published and may later be archived or retired; only published records are eligible for public retrieval (Fig. 1). Retired or conflicting canonical records do not revive an older hardcoded figure. Website monitoring stages detected numerical, academic-year and content changes for maintainer review before any publication. Missing source metadata is recorded as unknown rather than as verified provenance. Content hashes verify file integrity, source metadata identifies origin, and institutional review records approval; none of these alone establishes that the underlying information is correct or current.

Institutional facts were transcribed from approved or signed circulars and internally reviewed by the Authority, as reported by the project team. Three archived fee-table crops were inspected against the maintained amounts; because the crops omit signature blocks, institutional approval is attributed to the team. Source-image hashes preserve the inspected files.

### 3.2 Application Boundaries
React provides the browser interface, Node.js implements the HTTP API, and SQLite stores application collections and cached vectors (Table II). A modular monolith keeps public answering, authentication, knowledge maintenance, retrieval and evidence checks in separate modules, and the public and administration APIs are separate entry points that share one SQLite store. This design suits a small single-instance prototype. Optional embedding and generation requests, served by the Google Gemini API [17], are external integrations; deterministic rendering of maintained critical facts does not depend on them.

### TABLE II: IMPLEMENTED TECHNOLOGY STACK
| Component | Technology |
| :--- | :--- |
| Frontend | React 19, JavaScript/JSX, CSS; Vite 8 build; Lucide React icons |
| Backend | Node.js built-in HTTP module |
| Database | SQLite via node:sqlite (collections and cached vectors) |
| Retrieval | Weighted keyword/rule retrieval with conceptual synonym scoring; optional Gemini embeddings |
| Query interpretation | Dependency-free bounded rule-based parser |
| Optional generation | Google Gemini API |
| Source processing | Poppler PDF extraction, English Tesseract OCR, TXT/CSV |
| Testing | Node.js test runner; Playwright Core (Chrome/Edge) |
| Deployment files | Docker Compose and Nginx (not production-verified) |

The browser sends a question and conversation reference through the public API (Fig. 2). The backend validates the input, resolves selected context and determines the answer path. An authenticated maintainer updates the knowledge store through a separate boundary. Public retrieval excludes unavailable records, and source links allow inspection of the underlying record. The final response is an answer, a clarification, an unavailable-information response or a referral to human assistance.

### 3.3 Conversation Ownership
Public history is bound to a random HttpOnly session cookie with bounded exchanges and a 30-minute idle expiry. Reset deletes the active server history, startup and periodic pruning remove expired histories, and cross-session continuation is rejected. Admission approval is not inferred from conversational history. An institution-approved retention policy and production monitoring remain operational requirements.

---

## IV. SCOPE PRESERVATION AND ANSWER VERIFICATION

### 4.1 Query Interpretation and Retrieval
The backend normalizes selected English, Marathi, Hindi and transliterated expressions. A bounded parser extracts topics, programmes, entry route, academic year, category, gender and requested service; these are application-specific interpretations rather than unrestricted semantic understanding. Academic year and year of entry are kept separate, so “second year” is not converted automatically into a fee-circular year. Negated or conflicting profile values receive explicit handling instead of accumulating into an increasingly certain applicant profile.

The application retriever combines weighted lexical/rule scores with conceptual synonym boosts. Optional configured embeddings can contribute semantic similarity for English retrieval; their impact is outside the reported lexical comparison. Records carry publication and availability constraints. A high retrieval score does not by itself establish answerability: the selected record must also contain a supported value for the requested scope.

### 4.2 Structured Answer Selection
Let $s$ denote the interpreted scope (topic, route, academic year, category, gender and service) and $K$ the eligible published corpus. The answer path first checks whether the required scope fields and canonical facts are available. For selected critical topics, the response is rendered from those facts. Deterministic rendering suits these values because a single transposed digit or wrong year can mislead a family, canonical records can be audited and corrected in one place, and identical questions yield identical answers. When essential information is missing, the system asks for clarification or reports insufficient evidence instead of requesting a replacement amount from the model.

Follow-up handling preserves explicit user wording while carrying selected prior scope: a question about direct second-year charges replaces a preceding first-year route, and a new hostel question remains free of unrelated fee-topic text. These behaviors are tested; other dialogues and mixed-language expressions are left for further examination.

### 4.3 Optional Generation and Bounded Verification
Optional advisory generation receives bounded evidence. In the implementation, generation and embedding retrieval run only for English queries. Marathi and Hindi answers come from deterministic rendering and source-bound translations, which are bound to content hashes: when the underlying content changes, the translation becomes stale and the system falls back to English with an explicit notice. The client uses a finite overall deadline, transient-error retries and an optional configured fallback model. A returned draft is treated as untrusted until verified. Numeric checks reject selected unsupported values, promise checks reject unsupported guarantees of admission, placement or scholarship, and citation checks constrain supplied references. Specialized slot and clause checks compare selected fee, service and programme claims with structured evidence and reject certain unresolved or contradictory bindings.

Consider a document containing both a hostel amount $H$ and a mess amount $M$. A token checker can accept “hostel costs $M$; mess costs $H$” because both values appear in the source. MITRA’s bounded English clause checks associate each amount with its local service label, which closes the exposed swap probes. Full semantic entailment, including unfamiliar grammar, implicit comparison, coreference and novel cross-language generated prose, is outside the demonstrated coverage.

The decision order is: validate input, interpret scope, retrieve eligible evidence, clarify unresolved critical scope, render canonical facts when applicable, otherwise attempt bounded advisory generation, verify any draft, and fall back to supported content or an unavailable-information response. This sequence describes the implementation.

### 4.4 Safety Behavior, Human Escalation and Interface
Table III maps each situation to the designed response. When the published records lack the requested information, the assistant states no value and refers the user to human assistance through an admissions-counsellor contact card with a call-back request option (Fig. 6). In this paper, “human escalation” means referral for human assistance; transfer to a staffed helpdesk, call-back fulfilment, and storage and retention of submitted contact details were not evaluated.

### TABLE III: DESIGNED RESPONSE BY SITUATION
| Situation | Designed response |
| :--- | :--- |
| Ambiguous or underspecified request | Clarifying question, or rows for every category when only the category is missing |
| Unsupported or out-of-scope question | Safe refusal with official source link where relevant |
| Missing, unavailable or retired factual record | No value stated; referral to human assistance and official source |
| Numeric value not in evidence | Draft rejected by numeric check |
| Guarantee of admission, placement or scholarship | Draft rejected by promise check |
| Translation stale or missing | Explicit English fallback |
| Generation provider unavailable | Deterministic or safe fallback response |

The interface is a floating chat widget available without sign-in. Users select Automatic, English, Marathi or Hindi (Fig. 3), and answers appear as cards, tables, lists and official source links. Fig. 4 shows a compound query answered in one response: a hostel fee card for academic year 2026–27 with a confirmation note, followed by a library answer stating that borrowing rules, timings and access eligibility are not published. The mess amount is not displayed in this capture. Fig. 5 shows the transliterated query “first year fees kiti ahe” answered in Marathi; the response lists the first-year fee for every admission category and notes that the amounts are annual and that term-wise schedules are not given in the record. Fig. 6 shows the referral response for a question the records do not cover. Figs. 3–6 are author-selected captures that illustrate behavior.

---

## V. EVALUATION DESIGN AND REPRODUCIBILITY

### 5.1 Evidence Layers
Evaluation separates implementation regressions, retrieval diagnostics, verifier mutations and an Authority-evaluated pilot, and reports each layer separately because each answers a different question. Backend tests check application contracts, browser checks exercise rendered journeys, retrieval diagnostics assess relevance groups, verifier probes test the checking functions directly, and the pilot consists of live responses evaluated by the Authority.

Source-bound reports store corpus and case hashes, runtime metadata and implementation hashes, since an uncommitted working tree can differ from repository HEAD. Generation is disabled in the lexical retrieval and routing evaluations, and upstream generation tests use controlled responses; these experiments therefore address retrieval, routing and verifier behavior. Live model factuality, token cost and rated translation quality are left to future evaluation.

### 5.2 Retrieval Setup and Metric Definitions
The retrieval comparison uses the same 51-record seeded corpus and 44 development questions for four methods: the application keyword/rule retriever, raw BM25, normalized BM25, and reciprocal-rank fusion of lexical outputs. Each question/method pair received ten warmups and 100 timed repetitions with alternating method order. Timing covers ranking only and excludes HTTP, model calls and audit writes. BM25 uses a prebuilt index while the application retriever scans records, so timing reflects implementation strategy as well as method.

Each question has one or more developer-authored relevance groups representing acceptable records for a required facet. For question $q$ with group set $G_q$ and top-$k$ output $R_k(q)$, group Recall@k is the fraction of groups containing at least one returned record:
$$\text{Recall@}k(q) = \frac{|\{ g \in G_q : g \cap R_k(q) \neq \emptyset \}|}{|G_q|}$$

Group MRR@3 averages reciprocal first-hit ranks over those groups [18], assigning zero when the first match falls outside the top three. Reciprocal-rank fusion follows Cormack et al. [19]. Reported values are macro-averaged over questions. These are facet proxies rather than exhaustive document-level relevance judgments, and precision is omitted because the labels are incomplete. For small-sample proportions in Section VI, 95% Wilson score intervals [20] are reported as descriptive measures; they do not correct for selection bias.

### 5.3 Verifier Experiment
Fifteen exposed English probes comprise 11 deliberately invalid answers and four valid controls. Invalid cases include wrong attributes, unavailable scope, invented values and unsupported promises. The positive class is an answer that must be rejected. Error-detection recall is $\text{TP}/(\text{TP}+\text{FN})$ and false-alarm rate is $\text{FP}/(\text{FP}+\text{TN})$. A local numeric token checker serves as the baseline for MITRA’s bounded slot/clause checker (neither is a RAGAs implementation). Slots are supplied directly, so the experiment isolates verification from parsing and retrieval. Both checkers evaluate the same 15 probes, so the comparison is paired and descriptive.

### 5.4 Authority-Evaluated Live Pilot
A pilot of 30 questions was run on the live interface: ten in English, ten in Marathi and ten in Hindi. The candidate questions were AI-authored, and the Authority evaluated the responses. The Authority verified 26 correct answers and four referrals for questions concerning information outside the maintained knowledge base; the assistant directed these users to human assistance (Fig. 6). Pilot outcomes are reported separately from the development diagnostics.

### 5.5 Planned Independent Evaluation
An independently authored and labeled held-out question set is the planned next stage. Retrieval will be scored with Recall@1, Recall@3, Recall@5 and MRR on a frozen query set for the weighted-rule, BM25 and conceptual retrievers, with record-level relevance and separate reporting for answerable, ambiguous and unanswerable queries; questions sharing an information need and source record will stay within one split. A rubric will score correctness, completeness, evidence support, clarification/refusal appropriateness and language fidelity, rated by at least two independent raters who are blind to retriever identity, with adjudication and reported inter-rater agreement. Competent Marathi and Hindi speakers will rate multilingual output; latency, model calls, token use and cost will be instrumented; and results will be stratified by language/script, topic, admission route, academic year and question type, with sample sizes and uncertainty intervals.

---

## VI. RESULTS

### 6.1 Retrieval Diagnostics

### TABLE IV: DEVELOPMENT RETRIEVAL RESULTS ON 44 QUESTIONS AND 51 SEEDED RECORDS
| Method | Group R@1 / R@3 / MRR@3 | Ranking p50 / p95 (ms) |
| :--- | :---: | :---: |
| **Keyword/rules and concepts** | **0.8977 / 1.0000 / 0.9470** | **1.0246 / 1.4368** |
| BM25 raw | 0.6591 / 0.7727 / 0.7121 | 0.0312 / 0.0528 |
| BM25 normalized | 0.7955 / 0.9659 / 0.8769 | 0.0507 / 0.0826 |
| Reciprocal-rank fusion | 0.8750 / 0.9886 / 0.9280 | 1.1002 / 1.5640 |

Table IV shows a consistent ordering on these 44 questions. Normalization raises the group Recall@3 of BM25 from 0.7727 to 0.9659 and its MRR@3 from 0.7121 to 0.8769. The application retriever adds a further 0.0341 in group Recall@3 over normalized BM25 (1.0000 versus 0.9659) and improves group Recall@1 from 0.7955 to 0.8977, while reciprocal-rank fusion (0.9886) remains slightly below it in this snapshot. All four methods rank within 1.6 ms at p95, so ranking latency does not separate them in practice; the higher p50 of the application retriever (1.0246 ms) reflects its record scan, whereas BM25 uses a prebuilt index. Because the application rules and questions share development provenance, which can favor the existing pipeline, Table IV is read as a development diagnostic; it supports no significance test, superiority claim or production-latency interpretation. A group Recall@3 of 1.000 means that every labeled facet group receives a top-three hit on this set; it does not certify that each returned answer is correct.

### 6.2 Verifier Characterization

### TABLE V: DIRECT-FUNCTION DECISIONS ON 15 EXPOSED MUTATION AND CONTROL PROBES
| Checker | Invalid rejected / missed ($n = 11$) | Valid rejected / accepted ($n = 4$) | Error-detection recall |
| :--- | :---: | :---: | :---: |
| **Local numeric token checker** | 2 / 9 | 0 / 4 | 18.18% |
| **Bounded slot/clause checker** | **11 / 0** | **0 / 4** | **100%** |

Both observed false-alarm rates are 0/4, and the small denominators accompany every percentage. Earlier bounded fixes rejected 9 of the 11 invalid probes, and clause attribution closes the two exposed mixed-value swaps. Because both checkers were run on the same 15 probes and these probes informed debugging, the 2/11 versus 11/11 outcome is reported as a descriptive difference on exposed regression cases; it supports no inferential claim of superiority, and the final 11/11 result demonstrates regression closure rather than held-out detection accuracy. For reference, the 95% Wilson intervals are 74.1–100% for 11/11, 5.1–47.7% for 2/11 and 0–49.0% for 0/4 false alarms. Four valid controls are too few to estimate a general false-refusal rate.

### 6.3 Implementation and Operational Checks

### TABLE VI: DEVELOPER-AUTHORED REGRESSION CHECKS (ALL PASSED)
| Check | Result |
| :--- | :---: |
| Backend tests | 174 passed |
| Frontend tests | 16 passed |
| Routing/content cases | 500 passed |
| Strict public diagnostics | 36 passed |
| Paraphrase contract cases | 24 passed |
| Browser answer audit | 468 journeys passed (78 questions × 3 languages × 2 corpus snapshots) |

These developer-controlled checks are overlapping regression evidence: the 1,218 passed items are not 1,218 independent user questions and are not combined into an accuracy estimate. Frontend lint and production build also pass. A local model-disabled HTTP smoke test completes 100 requests at concurrency five (p50 26.76 ms, p95 36.62 ms) on in-memory SQLite with raised test limits, excluding network and provider overhead. A maintained-data backup with 1,146 asset files passes checksum verification and isolated restore.

### 6.4 Authority-Evaluated Pilot Outcomes

### TABLE VII: AUTHORITY-EVALUATED LIVE PILOT OUTCOMES
| Pilot scope | Questions | Correct answers | Human escalations |
| :--- | :---: | :---: | :---: |
| All three languages | 30 | 26 (86.67%) | 4 (13.33%) |

The Authority judged 26 of 30 responses correct (86.67%). The remaining four questions (13.33%) concerned information absent from the knowledge base and were referred to human assistance, so all 30 responses are accounted for and none was reported incorrect. The 13.33% is a referral share, not an error rate: the Authority judged the referrals to be the intended response to unavailable information. As classified by the evaluators, the outcome implies that all 26 answerable questions were answered correctly and all four unanswerable questions were referred. Because the 30 questions were AI-authored, with ten per language, the pilot is a descriptive outcome that complements the development diagnostics and is not an accuracy estimate for the deployed system. As a descriptive measure of sampling uncertainty, the 95% Wilson interval is 87.1–100% for 26 correct answers among 26 answerable questions, and 88.6–100% for 30 of 30 responses showing the intended behavior (a correct answer or an appropriate referral). These intervals reflect sample size only; they do not account for question selection or establish generalization. “Authority-evaluated” denotes evaluation by institutional reviewers and does not imply independent or blinded assessment.

### 6.5 Summary of Evidence

### TABLE VIII: SUMMARY OF EVIDENCE LAYERS AND WHAT EACH SUPPORTS
| Evidence layer | Result and what it supports |
| :--- | :--- |
| **Retrieval diagnostic (44 questions, 51 records)** | Group Recall@3 of 1.0000 and MRR@3 of 0.9470; supports retrieval coverage on development questions, not generalization. |
| **Verifier probes (15 probes)** | 11/11 invalid probes rejected and 4/4 valid controls accepted, against 2/11 rejected by the token checker; supports regression closure of the exposed cases. |
| **Regression checks (1,218 overlapping items)** | All passed; supports implementation stability, not accuracy. |
| **Authority-evaluated pilot (30 questions)** | 26 correct (86.67%), 4 appropriate referrals (13.33%), none incorrect; supports feasibility as a descriptive outcome. |

Table VIII collects the four evidence layers. Together they support the central claim for the defined cases, namely that explicit factual scope can be enforced while conversational access is preserved, at the level of feasibility and development evidence. Establishing generalization requires the independent evaluation described in Section 5.5.

---

## VII. DISCUSSION AND THREATS TO VALIDITY

### 7.1 What the Results Support
The evidence supports the feasibility of separating maintained critical facts from optional language generation in a small institutional assistant. Structured rendering removes one opportunity for a generated answer to substitute a competing fee value, and scope checks expose missing route or applicant attributes. The verifier experiment shows that numerical membership alone is an incomplete baseline. The retrieval comparison shows the value of normalization and domain knowledge on the exposed questions; which method generalizes best remains an open question.

The pilot adds a further observation: in the Authority evaluation, the assistant answered the answerable questions correctly and referred the four questions whose information is absent instead of guessing, which illustrates the distinction between answering and recognizing missing information. Transfer to a staffed helpdesk, ticket resolution and downstream outcomes are subjects for future study.

### 7.2 Internal and Construct Validity
Development leakage is the principal validity consideration. Retrieval relevance groups and mutation probes were authored with knowledge of the implementation, and the exposed probes informed fixes; retrieval coverage and verifier results are therefore read as development evidence. Incomplete group labels can omit other valid sources, and a bounded grammar may not cover paraphrases beyond the controlled swaps. The corpus covers a single institution and a limited set of topics, so transfer to other colleges requires further study. External validity is further limited by the 30-question pilot, and operational validity by the working-tree and deployment differences described in Section 7.3.

The 30-question pilot was AI-authored, and Authority involvement does not by itself make question collection independent of development; ten questions per language support descriptive reporting only. A future evaluation will fix the answerability label of each question against the frozen knowledge base before the response is examined, so that the classification of questions as answerable or unanswerable does not depend on the assistant’s output, and will report outcomes per language together with reviewer identities, review dates, per-question evidence and adjudication. Blinded assessment, ethics approval, participant consent, significance testing and inter-rater reliability are outside the scope of this pilot.

### 7.3 Language and Deployment Limits
Marathi and Hindi use selected interpretation rules and source-bound translations, and formal approval by competent Marathi and Hindi speakers is pending; the output is therefore treated as preliminary. Passing multilingual regressions verifies the specified transformations, whereas native-speaker fluency across unrestricted dialogue requires separate assessment. Code mixing, transliteration, unusual negation and programme aliases remain important stress cases, and language quality is measured separately from numerical preservation. Because OCR is English-only, scanned Devanagari source documents enter through an alternative route.

The development checks ran against a working tree that may differ from the deployed version, and later local changes await verification on the live site. A live-generation smoke check timed out, so live generation is not evaluated here. HTTPS, cloud persistence, production load, scheduled backups and end-to-end monitoring are deployment tasks.

### 7.4 Security and Privacy
Authentication, server-side authorization, controlled validation errors, rate limits and session ownership reduce specific application risks. Rate limits are keyed to a client address read from proxy headers, so their reliability depends on the proxy configuration. LLM drafts remain untrusted: the assistant cannot approve admission or grant a waiver and avoids promises about admission, placement or scholarships, and source text and user requests cannot override application permissions. Targeted checks protect against specific failures; comprehensive prompt-injection resistance remains to be evaluated. Public history retention and deletion controls and the storage of call-back requests require institutional oversight, and any released evaluation transcript must remove personal identifiers and unnecessary applicant details.

---

## VIII. CONCLUSION AND FUTURE WORK

MITRA implements multilingual institutional information access through maintained knowledge, explicit scope handling, structured critical-fact rendering and optional checked generation. The development experiments demonstrate the specified retrieval, verifier and application behaviors. In the Authority-evaluated pilot of 30 live questions (ten per language), 26 responses were judged correct and four were referred to human assistance because the information is absent from the knowledge base. Independent comparative accuracy is the objective of the planned evaluation described in Section 5.5.

Future work should freeze a deployed version and collect fresh student and parent questions independently of tuning, with the Authority labeling answerability, required facts and sources, as outlined in Section 5.5. Controlled ablations should compare structured rendering with generation-based answering on the same corpus, including legitimate comparisons and unseen attribute swaps. Further priorities are a larger valid-answer set to measure false refusals, stronger semantic claim verification, Devanagari OCR, production deployment with HTTPS, monitoring and load testing, a retention policy for call-back requests, and measurement of latency, model usage and cost.

---

## DATA AVAILABILITY
Project source: https://github.com/shraddha-2332/MITRA-The-Virtual-Assistant. Source-bound development summaries, corpus identifiers and limitations are stored under docs/research-review and identify working-file hashes, so they may describe a snapshot ahead of the committed and deployed versions. Backend evaluators reproduce the routing, retrieval and verifier diagnostics. Figs. 3–6 are unedited captures of the implemented application.

---

## ACKNOWLEDGMENT
The authors acknowledge Prof. Shobhana Raichurkar, Assistant Professor, Department of Computer Science and Engineering, MIT College of Railway Engineering & Research, Barshi, for project guidance, and the Authority members who evaluated the pilot responses. The authors used an AI assistant for language editing, document formatting and drafting of candidate pilot questions; the authors reviewed the content and are responsible for it.

---

## REFERENCES
1. P. Lewis et al., “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,” in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 33, 2020, pp. 9459–9474. [Online]. Available: https://arxiv.org/abs/2005.11401
2. S. Robertson and H. Zaragoza, “The Probabilistic Relevance Framework: BM25 and Beyond,” *Foundations and Trends in Information Retrieval*, vol. 3, no. 4, pp. 333–389, 2009, doi: 10.1561/1500000019.
3. L. Nguyen and T. Quan, “URAG: Implementing a Unified Hybrid RAG for Precise Answers in University Admission Chatbots—A Case Study at HCMUT,” *arXiv:2501.16276*, 2025. [Online]. Available: https://arxiv.org/abs/2501.16276
4. H.-T. Nguyen, Q.-D. Ngo, and Q.-D. Dang, “An Intent-Filtered Retrieval-Augmented Generation Chatbot for University Admissions in Vietnam,” in *Proc. Int. Conf. Advanced Technologies for Communications (ATC)*, 2024, doi: 10.1109/ATC63255.2024.10908188.
5. A. Nguyen-Duc et al., “An Empirical Study of Multi-Agent RAG for Real-World University Admissions Counseling,” *arXiv:2507.11272*, 2025. [Online]. Available: https://arxiv.org/abs/2507.11272
6. M. Maryamah et al., “Chatbots in Academia: A Retrieval-Augmented Generation Approach for Improved Efficient Information Access,” in *Proc. 16th Int. Conf. Knowledge and Smart Technology (KST)*, 2024, pp. 259–264, doi: 10.1109/KST61284.2024.10499652.
7. D. Kakwani et al., “IndicNLPSuite: Monolingual Corpora, Evaluation Benchmarks and Pre-trained Multilingual Language Models for Indian Languages,” in *Findings Assoc. Comput. Linguistics: EMNLP*, 2020, pp. 4948–4961, doi: 10.18653/v1/2020.findings-emnlp.445.
8. S. Es, J. James, L. Espinosa Anke, and S. Schockaert, “RAGAs: Automated Evaluation of Retrieval Augmented Generation,” in *Proc. EACL System Demonstrations*, 2024, pp. 150–158, doi: 10.18653/v1/2024.eacl-demo.16.
9. P. Mathur, A. Siu, N. Lipka, and T. Sun, “MATSA: Multi-Agent Table Structure Attribution,” in *Proc. EMNLP System Demonstrations*, 2024, pp. 250–258, doi: 10.18653/v1/2024.emnlp-demo.26.
10. K. S. Bukkapatnam and S. Mehta, “TabFaith: Benchmarking and Improving Structural Faithfulness in LLM Table Summarization,” in *Proc. First Workshop on Structured Understanding, Retrieval, and Generation in the LLM Era (SURGeLLM)*, 2026, pp. 326–332, doi: 10.18653/v1/2026.surgellm-1.21.
11. Z. Ji et al., “Survey of hallucination in natural language generation,” *ACM Comput. Surv.*, vol. 55, no. 12, Art. no. 248, 2023.
12. N. Thakur et al., “BEIR: A heterogeneous benchmark for zero-shot evaluation of information retrieval models,” in *Proc. NeurIPS Datasets and Benchmarks Track*, 2021.
13. J. H. Clark et al., “TyDi QA: A benchmark for information-seeking question answering in typologically diverse languages,” *Trans. Assoc. Comput. Linguistics*, vol. 8, pp. 454–470, 2020.
14. A. Asai et al., “XOR QA: Cross-lingual open-retrieval question answering,” in *Proc. NAACL-HLT*, 2021, pp. 547–564.
15. P. Buneman, S. Khanna, and W.-C. Tan, “Why and where: A characterization of data provenance,” in *Proc. Int. Conf. Database Theory (ICDT)*, LNCS vol. 1973, 2001, pp. 316–330.
16. Z. Chen, D. Zou, H. Xie, H. Lou, and Z. Pang, “Facilitating university admission using a chatbot based on large language models with retrieval-augmented generation,” *Educ. Technol. Soc.*, vol. 27, no. 4, pp. 454–470, 2024.
17. Gemini Team, Google, “Gemini: A family of highly capable multimodal models,” *arXiv:2312.11805*, 2023.
18. C. D. Manning, P. Raghavan, and H. Schütze, *Introduction to Information Retrieval*. Cambridge, U.K.: Cambridge Univ. Press, 2008.
19. G. V. Cormack, C. L. A. Clarke, and S. Büttcher, “Reciprocal rank fusion outperforms Condorcet and individual rank learning methods,” in *Proc. 32nd Int. ACM SIGIR Conf. Research and Development in Information Retrieval*, 2009, pp. 758–759, doi: 10.1145/1571941.1572114.
20. E. B. Wilson, “Probable inference, the law of succession, and statistical inference,” *J. Amer. Statist. Assoc.*, vol. 22, no. 158, pp. 209–212, 1927.
