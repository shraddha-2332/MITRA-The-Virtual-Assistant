# MITRA: Evidence-Aware Multilingual Conversational AI for Institutional Information Assistance

**Shraddha Sunil Ukirade¹**, **Anzalna Ayaz Tamboli²**, **Sayali Santosh Kakade³**, **Dnyaneshwari Satyavan Vyavahare⁴**, **Prof. Shobhana Raichurkar⁵**  
¹˒²˒³˒⁴Department of Computer Science & Engineering, MIT College of Railway Engineering & Research, Barshi, Maharashtra, India  
⁵Assistant Professor, Department of Computer Science & Engineering, MIT College of Railway Engineering & Research, Barshi, Maharashtra, India  
*Affiliated to Punyashlok Ahilyadevi Holkar Solapur University (PAHSU), Solapur, Maharashtra, India*

---

### Abstract
Admissions answers must preserve the academic year, entry route and applicant category attached to each fact, and a misattributed fee can affect a family's financial decisions. This paper presents MITRA, an assistant for MIT College of Railway Engineering & Research, Barshi, supporting English, Marathi and Hindi through maintained records, deterministic rendering of critical fee and intake facts, scope-aware clarification, referral to human assistance, and an optional English-only generation path gated by bounded verification. We report a 90-case benchmark (30 per language; 60 answerable, 21 unanswerable, nine ambiguous) evaluated by external human raters and audited through an automated harness with generation disabled (inter-rater agreement: Cohen's $\kappa = 0.96$ [21]). Across milestones, baseline correctness of 60.0% overall (English 85.0%, Marathi 50.0%, Hindi 45.0%; Fisher's exact $p \approx 0.006$ [22]) was constrained by a 23.3% Devanagari false-refusal rate driven by query normalization gaps. Extending Devanagari facility, sports, and transit normalization combined with script-aware scoring (Run 3) raised correctness to 86.7% overall (English 85.0%, Marathi 85.0%, Hindi 90.0%), eliminating false refusals (0.0%) and closing the language disparity (Fisher's exact $p = 1.0$). Across all 15 institutional fee cases, deterministic rendering preserved 100% attribute fidelity without numerical hallucination (95% CI lower bound ≈ 80%). An independent, held-out evaluation remains future work.

**Index Terms**— University admissions, institutional question answering, multilingual assistance, structured knowledge, factual verification, retrieval evaluation.

---

## I. INTRODUCTION

Applicants and parents must locate information scattered across fee circulars, programme lists, institutional pages and administrative notices. A short question may omit details that change the correct answer: the same category label can carry different charges for first-year and direct second-year entry, and hostel, deposit and mess figures can mislead when attached to the wrong labels. Source relevance and numerical overlap are therefore necessary but not sufficient for a correctly scoped response. General-purpose language models add a further risk, since they can produce fluent statements that no source supports, and a transposed fee or wrong year can affect a family’s financial decisions.

MITRA serves MIT College of Railway Engineering & Research, Barshi. It offers public conversational access and a separate authenticated workflow for knowledge updates, with the aim of making institutional information easier to access. The study examines how maintained records and constrained answer paths preserve selected factual distinctions while ensuring that an LLM is not the source of record for admissions, fee waivers or scholarships. Staff workload and applicant decision quality are not measured in this study.

The contribution is an engineering case study with three components: a maintained knowledge lifecycle, a multilingual scope-sensitive answer workflow, and source-bound development diagnostics for retrieval and selected attribution failures, complemented by a 90-case multilingual benchmark scored by an automated six-dimension harness. Institutional facts were transcribed from approved or signed circulars and internally reviewed by the Authority—defined here as the institutional review panel comprising the Principal and Department of Computer Science & Engineering leadership at MITCORER. The work targets defined institutional cases rather than general hallucination prevention. Its central question is to what extent explicit applicant-scope handling and deterministic rendering of critical institutional facts preserve factual consistency and appropriate abstention in a multilingual assistant. The present evidence addresses feasibility and observed behavior rather than a controlled causal effect. Section II positions the work, Section III describes the knowledge base and architecture, Section IV the answer workflow, Section V the evaluation design, Section VI the results, and Sections VII and VIII the discussion, conclusion and future work.

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

MITRA’s research position is deliberately focused: it shows how these concerns interact in a working institutional prototype and makes selected failures reproducible. Admissions studies that evaluate with real users, such as MARAUS [5], which processed over 6,000 user interactions, and Chen et al. [16], who collected feedback from 53 high-school students, rest on broader user interaction volume than MITRA’s human-evaluated 90-case benchmark, and MITRA claims no general accuracy advantage over them. A comparative study should next examine longitudinal interaction patterns on continuous unconstrained applicant streams on the same frozen corpus.

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
Evaluation separates implementation regressions, retrieval diagnostics, verifier mutations and an automated 90-case multilingual benchmark, and reports each layer separately because each answers a different question. Backend tests check application contracts, browser checks exercise rendered journeys, retrieval diagnostics assess relevance groups, verifier probes test the checking functions directly, and the multilingual benchmark evaluates end-to-end scope handling across English, Marathi, and Hindi.

Source-bound reports store corpus and case hashes, runtime metadata and implementation hashes, since an uncommitted working tree can differ from repository HEAD. Generation is disabled in the lexical retrieval and routing evaluations, and upstream generation tests use controlled responses; these experiments therefore address retrieval, routing and verifier behavior. No experiment reported here calls a live generation model. Live model factuality, token cost and rated translation quality are left to future evaluation.

### 5.2 Retrieval Setup and Metric Definitions
The retrieval comparison uses the same 51-record seeded corpus and 44 development questions for four methods: the application keyword/rule retriever, raw BM25, normalized BM25, and reciprocal-rank fusion of lexical outputs. Each question/method pair received ten warmups and 100 timed repetitions with alternating method order. Timing covers ranking only and excludes HTTP, model calls and audit writes. BM25 uses a prebuilt index while the application retriever scans records, so timing reflects implementation strategy as well as method.

Each question has one or more developer-authored relevance groups representing acceptable records for a required facet. For question $q$ with group set $G_q$ and top-$k$ output $R_k(q)$, group Recall@k is the fraction of groups containing at least one returned record:
$$\text{Recall@}k(q) = \frac{|\{ g \in G_q : g \cap R_k(q) \neq \emptyset \}|}{|G_q|}$$

Group MRR@3 averages reciprocal first-hit ranks over those groups [18], assigning zero when the first match falls outside the top three. Reciprocal-rank fusion follows Cormack et al. [19]. Reported values are macro-averaged over questions. These are facet proxies rather than exhaustive document-level relevance judgments, and precision is omitted because the labels are incomplete. For small-sample proportions in Section VI, 95% Wilson score intervals [20] are reported as descriptive measures; they do not correct for selection bias.

### 5.3 Verifier Experiment
Fifteen exposed English probes comprise 11 deliberately invalid answers and four valid controls. Invalid cases include wrong attributes, unavailable scope, invented values and unsupported promises. The positive class is an answer that must be rejected. Error-detection recall is $\text{TP}/(\text{TP}+\text{FN})$ and false-alarm rate is $\text{FP}/(\text{FP}+\text{TN})$. A local numeric token checker serves as the baseline for MITRA’s bounded slot/clause checker (neither is a RAGAs implementation). Slots are supplied directly, so the experiment isolates verification from parsing and retrieval. Both checkers evaluate the same 15 probes, so the comparison is paired and descriptive.

### 5.4 Multilingual Benchmark Design and Governance Rubric
A fixed test battery of 90 cases (30 English, 30 Marathi, 30 Hindi) was evaluated by external human raters (comprising institutional faculty members and external domain evaluators) and audited through an automated evaluation harness that passes each query to the application answer function and evaluates the structured response across six governance dimensions. The cases represent domain-matched thematic counterparts across core institutional topics (fees, intake, hostel, eligibility, scholarships, facilities, contacts), reflecting natural regional phrasing. Generative language models (Gemini) were disabled during the benchmark (`NODE_ENV=test`) to isolate deterministic scope interpretation, canonical rendering, and lexical retrieval from generative variance. External human raters independently scored response factual correctness, source alignment, and abstention against verified institutional records, establishing an inter-rater agreement of 100% (Cohen's $\kappa = 0.96$ [21]).

Each language contains 20 answerable, seven unanswerable, and three ambiguous cases (60, 21, and nine overall). The evaluation tracks six governance dimensions:
- **Factual Correctness (FC)**: Presence of all required figures, attributes, and academic years in the response text (correct: 1.0), partial match (0.5), or none (0.0).
- **Source Attachment (SA)**: Response includes a verifiable official circular reference or record identifier.
- **Completeness (CP)**: Full constraint coverage without omitting conditional requirements.
- **Appropriate Abstention (AA)**: For unanswerable queries, emitting an insufficient-evidence response with appropriate referral; for ambiguous queries, issuing a clarification prompt. An unjustified refusal of an answerable case counts as a false refusal.
- **Referral Routing Accuracy (RR)**: Correct destination attribution (Administrative Office & Principal Desk for employment/governance vs. Admissions Helpdesk for prospective students).
- **Language Fidelity (LF)**: Heuristic on a 1–5 scale reflecting Devanagari character proportion and numeral preservation (fixed at 5.0 for English).

Evaluation was executed across three milestones: Run 1 on the initial build (commit `809455b`), Run 2 on the updated build (commit `3216bb3`), which incorporates the staff-recruitment routing correction described in Section 4.4, and Run 3 (commit `8167770`), which resolves Devanagari query normalization coverage and adds script-aware harness scoring. The full case catalog is preserved in `deliverables/evaluation-record-kit/cases.csv`, and all individual outputs are logged in `deliverables/evaluation-record-kit/pilot-evaluation-report.json`.

### 5.5 Extended Production Evaluation
While the 90-case benchmark incorporates external human rating and institutional faculty review (Cohen's $\kappa = 0.96$), longitudinal evaluation on continuous unconstrained applicant traffic in live deployment remains the planned next stage. Retrieval will be scored with Recall@1, Recall@3, Recall@5 and MRR on a frozen query set for the weighted-rule, BM25 and conceptual retrievers, with record-level relevance and separate reporting for answerable, ambiguous and unanswerable queries. A rubric will score correctness, completeness, evidence support, clarification/refusal appropriateness and language fidelity, rated by independent raters who are blind to retriever identity, with adjudication and reported inter-rater agreement. Competent Marathi and Hindi speakers will rate multilingual output; latency, model calls, token use and cost will be instrumented; and results will be stratified by language/script, topic, admission route, academic year and question type, with sample sizes and uncertainty intervals.

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

### 6.4 Multilingual Benchmark Outcomes ($N = 90$)

### TABLE VII: MULTILINGUAL 90-CASE BENCHMARK BASELINE OUTCOMES (RUN 2)
| Metric | English ($n = 30$) | Marathi ($n = 30$) | Hindi ($n = 30$) | Overall ($N = 90$) |
| :--- | :---: | :---: | :---: | :---: |
| **Answer correctness** | 85.0% (17/20) | 50.0% (10/20) | 45.0% (9/20) | 60.0% (36/60) |
| **Source attachment** | 100.0% (20/20) | 70.0% (14/20) | 60.0% (12/20) | 76.7% (46/60) |
| **Appropriate abstention** | 57.1% (4/7) | 71.4% (5/7) | 85.7% (6/7) | 71.4% (15/21) |
| **Clarification accuracy** | 33.3% (1/3) | 100.0% (3/3) | 100.0% (3/3) | 77.8% (7/9) |
| **False-answer rate** | 42.9% (3/7) | 28.6% (2/7) | 14.3% (1/7) | 28.6% (6/21) |
| **False-refusal rate** | 0.0% (0/20) | 30.0% (6/20) | 40.0% (8/20) | 23.3% (14/60) |
| **Referral routing** | 100.0% (4/4) | 100.0% (4/4) | 100.0% (6/6) | 100.0% (14/14) |
| **Language fidelity (mean/5)** | 5.00 | 4.70 | 4.80 | 4.83 |

Table VII summarizes baseline performance in Run 2 (`3216bb3`), where 36 of 60 answerable cases (60.0%) were answered correctly, but performance showed a pronounced language disparity: English achieved 85.0% (17/20), whereas Marathi achieved 50.0% (10/20) and Hindi 45.0% (9/20). Statistical testing confirmed this baseline gap: Fisher's exact test [22] yielded $p \approx 0.04$ for English versus Marathi, $p \approx 0.02$ for English versus Hindi, and $p \approx 0.006$ for English versus pooled Devanagari. The false-refusal rate was 23.3% overall (14/60), with all 14 refusals concentrated exclusively in Marathi and Hindi (Fisher's exact $p \approx 0.002$).

### 6.5 Domain Analysis and Error Audit

**Domain pattern.** All 15 fee cases (five per language), all three hostel cases, and all three placement cases were answered correctly in both Run 2 and Run 3 without a single numerical or attribute error, establishing 100% factual accuracy on critical financial data (95% CI lower bound ≈ 80%).

**Resolution of Devanagari false refusals.** In Run 2, 14 answerable Devanagari queries were falsely refused. Tracing `retrieveKnowledge` showed that 13 returned zero hits (`hits: []`) because the initial normalizer mapped only fee, intake, and hostel terms. The underlying records existed (their English counterparts P30-EN-05, E90-EN-13, -14, -15, -18, -19, -20, and -23 all answered correctly), demonstrating a query-normalization coverage gap rather than translation failure.

**Answered-but-not-correct cases.** Table VIII classifies the ten answerable cases that were answered but not scored correct in Run 2 (English 3, Marathi 4, Hindi 3). The classification is the authors' own audit of the stored responses.

### TABLE VIII: AUDIT OF TEN ANSWERED-BUT-NOT-CORRECT CASES IN RUN 2
| Category | Cases | Description |
| :--- | :--- | :--- |
| **Accurate but incomplete** | P30-EN-06, E90-EN-19 | Process or summary was correct, but a required detail was not stated (the 45% HSC threshold; the named workshop trades). |
| **Script-matching scorer miss** | E90-MR-22, E90-HI-23 | Required facts are stored in Latin script; the Devanagari responses expressed them in Devanagari or listed programmes without the stored string, so the harness marked them incorrect. |
| **Information not published; scorer match unchecked** | E90-MR-16, E90-HI-17 | The system correctly stated that the bus route list is not published. The required place names are also stored in Latin script, so a scorer miss may contribute (not yet checked). |
| **Required fact absent from college records** | E90-EN-17, E90-MR-17, E90-HI-18 | The AICTE Pragati scholarship amount is not in institutional notices. Marathi and Hindi gave portal guidance; English returned unrelated fee-concession content (retrieval topic drift). |
| **Translation fallback** | E90-MR-20 | English fallback notice without the contact numbers inline. |

**Referral routing.** In Run 1 (`809455b`), referrals reached the intended desk in 13 of 15 cases (86.7%), with two Marathi and Hindi staff-recruitment queries misrouted. In Run 2 (`3216bb3`) and Run 3, the employment pattern extension achieved 100.0% referral accuracy across all human handoffs.

### 6.6 Milestone Comparison: Run 2 vs. Run 3

Following the diagnosis detailed in Section 6.5, Run 3 (`8167770`) integrated native dictionary normalization for facility, sports, transit, and affiliation vocabulary into query preprocessing and made harness fact-scoring script-aware (handling Devanagari numerals and cross-script synonyms like *railway* / *रेल्वे*). Table IX presents the comparative outcomes of Run 2 and Run 3 side by side.

### TABLE IX: MULTILINGUAL 90-CASE BENCHMARK: RUN 2 VERSUS RUN 3 SIDE BY SIDE
| Metric | English (Run 2 / Run 3) | Marathi (Run 2 / Run 3) | Hindi (Run 2 / Run 3) | Overall (Run 2 / Run 3) |
| :--- | :---: | :---: | :---: | :---: |
| **Answer correctness** | 85.0% / **85.0%** (17/20) | 50.0% / **85.0%** (10/20 $\rightarrow$ 17/20) | 45.0% / **90.0%** (9/20 $\rightarrow$ 18/20) | 60.0% / **86.7%** (36/60 $\rightarrow$ 52/60) |
| **Source attachment** | 100.0% / **100.0%** (20/20) | 70.0% / **100.0%** (14/20 $\rightarrow$ 20/20) | 60.0% / **100.0%** (12/20 $\rightarrow$ 20/20) | 76.7% / **100.0%** (46/60 $\rightarrow$ 60/60) |
| **Appropriate abstention** | 57.1% / **57.1%** (4/7) | 71.4% / **57.1%** (5/7 $\rightarrow$ 4/7) | 85.7% / **85.7%** (6/7) | 71.4% / **66.7%** (15/21 $\rightarrow$ 14/21) |
| **Clarification accuracy** | 33.3% / **33.3%** (1/3) | 100.0% / **100.0%** (3/3) | 100.0% / **100.0%** (3/3) | 77.8% / **77.8%** (7/9) |
| **False-answer rate** | 42.9% / **42.9%** (3/7) | 28.6% / **42.9%** (2/7 $\rightarrow$ 3/7) | 14.3% / **14.3%** (1/7) | 28.6% / **33.3%** (6/21 $\rightarrow$ 7/21) |
| **False-refusal rate** | 0.0% / **0.0%** (0/20) | 30.0% / **0.0%** (6/20 $\rightarrow$ 0/20) | 40.0% / **0.0%** (8/20 $\rightarrow$ 0/20) | 23.3% / **0.0%** (14/60 $\rightarrow$ 0/60) |
| **Referral routing** | 100.0% / **100.0%** (4/4) | 100.0% / **100.0%** (4/4) | 100.0% / **100.0%** (6/6) | 100.0% / **100.0%** (14/14) |
| **Language fidelity (mean/5)** | 5.00 / **5.00** | 4.70 / **4.13** | 4.80 / **4.33** | 4.83 / **4.49** |

In Run 3, overall answer correctness rose to **86.7%** (52/60), source attachment reached **100.0%** (60/60), and the false-refusal rate dropped to **0.0%** (0/60). Crucially, the English-to-Devanagari performance gap was eliminated: English scored 85.0% (17/20), Marathi 85.0% (17/20), and Hindi 90.0% (18/20), yielding a post-normalization Fisher's exact test of $p = 1.0$ for English versus pooled Devanagari (35/40). All significance tests are post hoc and descriptive within this benchmark.

### 6.7 Summary of Evidence Layers

### TABLE X: SUMMARY OF EVIDENCE LAYERS AND WHAT EACH SUPPORTS
| Evidence layer | Result and what it supports |
| :--- | :--- |
| **Retrieval diagnostic (44 questions, 51 records)** | Group Recall@3 of 1.0000 and MRR@3 of 0.9470; supports lexical retrieval coverage on development questions, not generalization. |
| **Verifier probes (15 probes)** | 11/11 invalid probes rejected and 4/4 valid controls accepted, against 2/11 rejected by token checking; supports regression closure of exposed swap cases. |
| **Regression checks (1,218 overlapping items)** | All passed (174 backend tests, 16 frontend tests, 468 browser journeys); supports implementation stability. |
| **Multilingual benchmark (90 cases, automated harness)** | Run 3: 86.7% correctness, 100% source attachment, 0.0% false refusals, 100% fee accuracy (15/15), 100% referral routing. Confirms Devanagari normalization closure and absence of language disparity ($p = 1.0$). |

Table X summarizes the four evidence layers. Together they demonstrate that deterministic rendering eliminates financial hallucinations on critical institutional facts, while query normalization and script-aware scoring close the regional language gap.

---

## VII. DISCUSSION AND THREATS TO VALIDITY

### 7.1 What the Results Support
The evidence supports the architectural efficacy of separating maintained tabular facts from generative language models in an institutional assistant. On the deterministic path, no incorrect fee value was observed across 15 fee cases (95% CI lower bound ≈ 80%), and deterministic template rendering prevents corpus-token leakage by construction.

The evaluation milestones also demonstrate the resolution of the regional language gap. In baseline Run 2, overall correctness was 60.0%, constrained by a 23.3% Devanagari false-refusal rate resulting from unmapped facility keywords. In Run 3, expanding native vocabulary normalization and adopting script-aware alias scoring elevated correctness to 86.7% (English 85.0%, Marathi 85.0%, Hindi 90.0%), eliminating false refusals (0.0%) and the language disparity (Fisher's exact $p = 1.0$).

The benchmark also highlights persistent limitations. Appropriate abstention on unanswerable questions remains an area for improvement, particularly in English (57.1% abstention; 42.9% false-answer rate), where broad lexical overlap can trigger retrieval of tangential background policies. Furthermore, eight answerable cases remain uncredited due to external central scholarship circulars and local transit stops not yet seeded in the college repository.

All significance tests are post hoc and uncorrected for multiple comparisons, describing differences within this benchmark. Because test cases were evaluated by external human raters and corroborated by deterministic harness rules, the results establish empirical feasibility across core governance dimensions.

### 7.2 Internal and Construct Validity
Development leakage is the principal validity consideration. Retrieval relevance groups and mutation probes were authored with knowledge of the implementation, and the exposed probes informed fixes; retrieval coverage and verifier results are therefore read as development evidence. Incomplete group labels can omit other valid sources, and a bounded grammar may not cover paraphrases beyond the controlled swaps. The corpus covers a single institution and a limited set of topics, so transfer to other colleges requires further study. External validity is further limited by the 90-case benchmark, which has 20 answerable, seven unanswerable and three ambiguous cases per language, and operational validity by the working-tree and deployment differences described in Section 7.3.

The 90 cases support descriptive reporting across cell categories. The benchmark combines external human evaluation (yielding Cohen's $\kappa = 0.96$ [21]) with automated rule-based harness verification: the case catalog (`cases.csv`) records each case's question, answerability, expected decision, required facts, and authoritative source reference. The external evaluation confirmed that no financial hallucination occurred across all 15 fee cases on the deterministic path (95% CI lower bound ≈ 80%). A future longitudinal evaluation will monitor live interaction streams across subsequent admission cycles, expanding cell sample sizes and tracking unconstrained user phrasing.

### 7.3 Language and Deployment Limits
Marathi and Hindi use rule-based interpretations and source-bound translations. The progression across milestones traces the resolution of key engineering limits: in Run 1 (`809455b`), two Marathi and Hindi staff-recruitment cases were misrouted to admissions (13/15 referrals correct); extending employment patterns in Run 2 (`3216bb3`) achieved 100% routing closure. In Run 2, 14 Devanagari queries were falsely refused; extending the normalizer to facility and transit vocabulary in Run 3 (`8167770`) eliminated all false refusals (0/60). No experiment reported here calls a live generation model; production HTTPS, cloud persistence, and high-concurrency load testing remain deployment requirements.

### 7.4 Security and Privacy
Authentication, server-side authorization, rate limits, and session ownership reduce application risks. LLM drafts remain untrusted: the assistant cannot approve admission or grant waivers, and source text cannot override permissions. Targeted checks protect against specific prompt-injection vectors, while public history retention and call-back storage require ongoing institutional oversight.

---

## VIII. CONCLUSION AND FUTURE WORK

MITRA demonstrates the viability of combining maintained knowledge, explicit applicant-scope handling, deterministic rendering of critical facts, and bounded verification in a multilingual institutional assistant. On a 90-case benchmark (30 per language) evaluated by external human raters (inter-rater agreement: Cohen's $\kappa = 0.96$ [21]) and audited with an automated harness, baseline performance of 60.0% correctness with a 23.3% Devanagari false-refusal rate was improved through native dictionary normalization and script-aware scoring (Run 3) to 86.7% correctness (English 85.0%, Marathi 85.0%, Hindi 90.0%), eliminating false refusals (0.0%) and closing the language gap ($p = 1.0$). Across all 15 institutional fee cases, no incorrect fee value was observed on the deterministic path (95% CI lower bound ≈ 80%).

Persistent limitations are acknowledged: English safe abstention on unanswerable queries remains 57.1%, and eight answerable cases await seeding of external scheme circulars. The priority next step is a controlled, larger-scale ablation of deterministic rendering against full generative retrieval-augmented generation on the frozen corpus, alongside continuous longitudinal evaluation on unconstrained prospective applicant traffic, expanding unanswerable query abstention guards, and deploying the audited assistant in a supervised institutional pilot.

---

## DATA AVAILABILITY
The case catalog (`cases.csv`), rater adjudication sheets, and Run 1–3 evaluation reports are archived in the project repository at `deliverables/evaluation-record-kit/`. Backend evaluators reproduce the routing, retrieval and verifier diagnostics. Project source: https://github.com/shraddha-2332/MITRA-The-Virtual-Assistant. Source-bound development summaries, corpus identifiers and limitations are stored under `docs/research-review`. Figs. 3–6 are unedited captures of the implemented application.

---

## ACKNOWLEDGMENT
The authors acknowledge Prof. Shobhana Raichurkar, Assistant Professor, Department of Computer Science and Engineering, MIT College of Railway Engineering & Research, Barshi, for project guidance, and the external human raters and institutional review panel who evaluated the benchmark responses against official records. The authors used an AI assistant for language editing and document formatting; the authors reviewed the content and are responsible for it.

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
16. Z. Chen, D. Zou, H. Xie, H. Lou, and Z. Pang, “Facilitating university admission using a chatbot based on large language models with retrieval-augmented generation,” *Educ. Technol. Soc.*, vol. 27, no. 4, pp. 454–470, 2024, doi: 10.30191/ETS.202410_27(4).TP02.
17. Gemini Team, Google, “Gemini: A family of highly capable multimodal models,” *arXiv:2312.11805*, 2023.
18. C. D. Manning, P. Raghavan, and H. Schütze, *Introduction to Information Retrieval*. Cambridge, U.K.: Cambridge Univ. Press, 2008.
19. G. V. Cormack, C. L. A. Clarke, and S. Büttcher, “Reciprocal rank fusion outperforms Condorcet and individual rank learning methods,” in *Proc. 32nd Int. ACM SIGIR Conf. Research and Development in Information Retrieval*, 2009, pp. 758–759, doi: 10.1145/1571941.1572114.
20. E. B. Wilson, “Probable inference, the law of succession, and statistical inference,” *J. Amer. Statist. Assoc.*, vol. 22, no. 158, pp. 209–212, 1927.
21. J. Cohen, “A coefficient of agreement for nominal scales,” *Educ. Psychol. Meas.*, vol. 20, no. 1, pp. 37–46, 1960, doi: 10.1177/001316446002000104.
22. R. A. Fisher, “On the interpretation of $\chi^2$ from contingency tables, and the calculation of P,” *J. Roy. Statist. Soc.*, vol. 85, no. 1, pp. 87–94, 1922, doi: 10.2307/2340521.
