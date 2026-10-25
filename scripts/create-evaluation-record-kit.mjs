// Blank data-entry templates only. Never creates experimental outcomes or ratings.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'deliverables/evaluation-record-kit');
if (fs.existsSync(directory)) throw new Error('Record kit already exists; refusing to overwrite possible reviewer work.');
fs.mkdirSync(directory, { recursive: true });
const csv = (headers, prefix) => '\uFEFF' + [headers.join(','), ...Array.from({ length: 90 }, (_, i) =>
  headers.map((_, column) => column === 0 ? `${prefix}${String(i + 1).padStart(3, '0')}` : '').join(','))].join('\r\n') + '\r\n';
const files = {
  'cases.csv': csv(['case_id', 'group_id', 'question_author_id', 'authored_at_utc', 'split', 'language', 'script', 'topic', 'turns_file', 'question', 'reference_answerability', 'reference_expected_decision', 'required_facts', 'prohibited_claims', 'source_file', 'source_page_or_record_id', 'source_sha256', 'reference_rationale', 'label_reviewer_id', 'labeled_at_utc', 'first_exposure_at_utc'], 'C'),
  'responses.csv': csv(['response_id', 'run_id', 'case_id', 'turn_index', 'attempt_id', 'blinded_method_id', 'capture_mode', 'request_started_at_utc', 'response_completed_at_utc', 'latency_ms', 'http_status', 'exact_response_file', 'response_sha256', 'screenshot_file', 'retrieved_ids_file', 'model_metadata_file', 'actual_decision', 'error_type', 'error_message', 'observed_ui_handoff', 'notes'], 'O'),
  'ratings-template.csv': csv(['rating_id', 'response_id', 'case_id', 'reviewer_id', 'reviewed_at_utc', 'reference_answerability', 'correctness', 'completeness', 'evidence_support', 'decision_appropriate', 'wrong_amount', 'wrong_year', 'wrong_route_category_or_gender', 'unsupported_claim_count', 'claims_assessed', 'supported_claims', 'meaning_fidelity_1_to_5', 'terminology_1_to_5', 'fluency_1_to_5', 'rationale', 'review_duration_seconds'], 'J'),
  'adjudication.csv': csv(['adjudication_id', 'response_id', 'case_id', 'reviewer1_rating_id', 'reviewer2_rating_id', 'disagreement', 'adjudicator_id', 'adjudicated_at_utc', 'final_correctness', 'final_decision_appropriate', 'final_evidence_support', 'rationale', 'error_category', 'include_in_analysis', 'exclusion_reason'], 'A'),
  'run-manifest.json': JSON.stringify({
    status: 'blank-template-not-an-evaluation', runId: null, protocolVersion: null,
    preregisteredAtUtc: null, runStartedAtUtc: null, runCompletedAtUtc: null,
    endpoint: null, captureMode: null, deployedVersion: null, gitCommit: null, workingTreeDirty: null,
    sourceHashes: {}, corpusFile: null, corpusSha256: null, sourceDocumentManifestFile: null,
    caseFile: 'cases.csv', caseFileSha256: null, caseCountCollected: 0,
    generationEnabled: null, embeddingEnabled: null, modelName: null, modelVersion: null,
    generationParameters: {}, nodeVersion: null, operatingSystem: null,
    methods: [], methodOrderPolicy: null, retryPolicy: null, repeatedRunPolicy: null,
    inclusionExclusionPolicy: null, splitGroupingPolicy: null, rubricFile: null,
    questionAuthors: [], reviewers: [], adjudicators: [],
    independenceDeclarationFile: null, anonymizedReviewerMappingPrivateFile: null,
    languageCompetenceEvidencePrivateFile: null, sourceAccessAuthorization: null,
    publicationPermission: null, knownLimitations: [],
    warning: 'Do not infer completed cases or independence from blank template capacity. Never store secrets.'
  }, null, 2) + '\n',
  'raw-turn-template.json': JSON.stringify({
    status: 'blank-template', runId: null, responseId: null, caseId: null, turnIndex: null, attemptId: null,
    captureMode: null, question: null, language: null, previousTurns: [],
    requestStartedAtUtc: null, responseCompletedAtUtc: null, httpStatus: null,
    exactVisibleAnswer: null, rawApiPayload: null, citations: [],
    outcomeNotice: null, escalationOffered: null, escalationSubmitted: null,
    counselorReceiptConfirmed: null, technicalError: null,
    note: 'Record only observed events. API payload is null for UI-only capture; no invented internal metadata. Do not include cookies or real applicant contact details.'
  }, null, 2) + '\n',
  'README.md': `# MITRA evaluation record kit\n\nThis is a blank record kit, not completed research data. Ninety ID rows per CSV are capacity only; no questions, answers, ratings, reviewers or approvals are supplied.\n\n1. Copy this kit into a new private run directory, for example backend/evaluation/reports/independent-run-01 (already ignored by Git). Back it up privately; do not rely on Git for private raw records.\n2. Read docs/INDEPENDENT_EVALUATION_STRENGTHENING_REVIEW.md and agree the protocol before collecting questions.\n3. Fill run-manifest.json. Faculty labels cases.csv against frozen documentary sources before seeing MITRA answers. Use actual author/reviewer codes; keep personal identity mappings private.\n4. Save exact UI responses or API payloads under raw/, one file per case/turn/attempt, and index them in responses.csv. Save hashes, sources and timestamps. Screenshots supplement rather than replace text. A browser run and API run are different capture modes.\n5. Give separate copies of ratings-template.csv to reviewer R1 and reviewer R2. They enter their own reviewer IDs and real response/case IDs. The same template rating IDs may be reused only within separate files; use composite reviewer+rating IDs in adjudication.csv. Preserve returned original files.\n6. Complete adjudication.csv after both ratings, preserving disagreement and rationale. Summarize only real eligible scored responses with explicit denominators. Exclude blank stubs from all counts.\n\n## Labels\n\nreference_answerability: answerable / ambiguous / unsupported / partially-answerable.\nreference_expected_decision and actual_decision: answer / clarify / abstain / refer / technical-error.\ncorrectness: correct / partial / incorrect / not-applicable.\ncompleteness: complete / partial / incomplete / not-applicable.\nevidence_support: full / partial / unsupported / contradicted / not-applicable.\ndecision_appropriate and other Boolean judgments: yes / no / not-applicable; unknown stays blank with rationale.\nLanguage scores: 1 serious meaning/communication problems; 2 substantial problems; 3 understandable with problems; 4 clear with minor problems; 5 clear and appropriate. Score meaning, terminology and fluency separately; do not score an unqualified language review.\n\nCSV files are UTF-8 with a BOM for Excel and Marathi/Hindi support. Use Excel Data > From Text/CSV when necessary; import identifiers, timestamps and raw response text as text. Do not execute spreadsheet formulas from pasted user text. Keep complete raw UTF-8 transcripts outside cells, including long answers. An output ID does not mean that an actual output was collected.\n\n## Integrity and analysis\n\nFor a file hash in PowerShell: Get-FileHash -Algorithm SHA256 -LiteralPath <file>. Store the result with the exact file/version. Never rewrite transcripts after hashing. SHA-256 detects changes; it does not prove reviewer independence or truth. Preserve raw scores, adjudication and analysis as different files. No automatic result formulas or fabricated totals are included.\n\nKeep the old 30-question aggregate report separate. Re-running those exposed cases produces a new recorded pilot, not a retrospective original dataset or a new held-out set.\n`
};
for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(directory, name), content, { flag: 'wx' });
const checksums = Object.entries(files).map(([name, content]) => `${crypto.createHash('sha256').update(content).digest('hex')}  ${name}`).join('\n') + '\n';
fs.writeFileSync(path.join(directory, 'template-checksums.sha256'), checksums, { flag: 'wx' });
console.log(JSON.stringify({ directory, csvTemplates: 4, rowsPerCsv: 90, collectedCases: 0, scoredResponses: 0 }));
