import { verifyGeneratedAnswer, verifySlotGrounding } from '../src/grounding.js';

// Deliberately exposed synthetic development probes, not independently authored questions.
export function verifierCases(corpus) {
  const fee = corpus.find(record => record.id === 'KB-2');
  const stay = corpus.find(record => record.id === 'KB-3');
  const intake = corpus.find(record => record.id === 'KB-10');
  if (!fee?.facts?.firstYear || !fee.facts.directSecondYear || !stay?.facts || !intake?.facts?.programs?.length) {
    throw new Error('Expected structured seed fee, accommodation and intake records');
  }
  const fy = fee.facts.firstYear;
  const dse = fee.facts.directSecondYear;
  const year = fee.facts.academicYear;
  const money = value => `INR ${new Intl.NumberFormat('en-IN').format(value)}`;
  const slots = { category: 'OBC', gender: 'girls', route: 'First Year', academicYear: year };
  const target = intake.facts.programs.find(program => program.intake === 120);
  const other = intake.facts.programs.find(program => program.intake !== target?.intake);
  if (!target || !other || fy.concessionGirl === fy.concessionBoy || dse.concessionBoy === fy.concessionBoy) {
    throw new Error('Diagnostic mutations require distinct competing seed values');
  }
  const row = (id, family, question, answer, expectedReject, evidence, querySlots, rationale) => ({
    id, family, question, answer, expectedReject, evidenceIds: evidence.map(record => record.id), slots: querySlots, rationale,
  });
  return [
    row('VD-01', 'fee', `What is the first-year OBC girl fee for ${year}?`, `OBC girls pay ${money(fy.concessionGirl)} for First Year in ${year}.`, false, [fee], slots, 'Correct target cell.'),
    row('VD-02', 'wrong-row', `What is the first-year OBC girl fee for ${year}?`, `OBC girls pay ${money(fy.concessionBoy)} for First Year in ${year}.`, true, [fee], slots, 'Competing boys amount assigned to girls.'),
    row('VD-03', 'mixed-wrong-row', `What is the first-year OBC girl fee for ${year}?`, `OBC girls pay ${money(fy.concessionBoy)} and OBC boys pay ${money(fy.concessionGirl)} for First Year in ${year}.`, true, [fee], slots, 'Both values exist, but row labels are swapped.'),
    row('VD-04', 'comparison', `What is the first-year OBC girl fee for ${year}?`, `OBC girls pay ${money(fy.concessionGirl)} and OBC boys pay ${money(fy.concessionBoy)} for First Year in ${year}.`, false, [fee], slots, 'A correctly labeled comparison must not be rejected.'),
    row('VD-05', 'wrong-route', `What is the DSE OBC boy fee for ${year}?`, `DSE OBC boys pay ${money(fy.concessionBoy)} for ${year}.`, true, [fee], { category: 'OBC', gender: 'boys', route: 'DSE', academicYear: year }, 'First-year value substituted for DSE.'),
    row('VD-06', 'wrong-year', 'What was the OBC girl first-year fee in 2018-19?', `OBC girls pay ${money(fy.concessionGirl)} for First Year in ${year}.`, true, [fee], { ...slots, academicYear: '2018-19' }, 'Current-year evidence cannot answer the requested historical year.'),
    row('VD-07', 'missing-slot', `I am OBC. What is my DSE fee for ${year}?`, `Your DSE fee is ${money(dse.concessionBoy)} for ${year}.`, true, [fee], { category: 'OBC', route: 'DSE', academicYear: year }, 'A personal single fee requires gender clarification; defaulting to boys is unsupported.'),
    row('VD-08', 'mess', 'What is the annual mess fee?', `Annual mess fee is ${money(stay.facts.messAnnual)}.`, false, [stay], { service: 'mess' }, 'Correct service amount.'),
    row('VD-09', 'wrong-service', 'What is the annual mess fee?', `Annual mess fee is ${money(stay.facts.hostel)}.`, true, [stay], { service: 'mess' }, 'Hostel amount assigned to mess.'),
    row('VD-10', 'mixed-wrong-service', 'What is the annual mess fee?', `Annual mess fee is ${money(stay.facts.hostel)} and hostel fee is ${money(stay.facts.messAnnual)}.`, true, [stay], { service: 'mess' }, 'Presence of expected amount does not repair swapped service labels.'),
    row('VD-11', 'intake', `What is the intake for ${target.name}?`, `${target.name} intake is ${target.intake} seats.`, false, [intake], { branch: target.name }, 'Correct programme intake.'),
    row('VD-12', 'wrong-intake', `What is the intake for ${target.name}?`, `${target.name} intake is ${other.intake} seats.`, true, [intake], { branch: target.name }, 'Another programme intake assigned to target.'),
    row('VD-13', 'wrong-code', `What is the choice code for ${target.name}?`, `${target.name} choice code is ${other.choiceCode}.`, true, [intake], { branch: target.name }, 'Another programme code exists in evidence but is not the requested code.'),
    row('VD-14', 'unsupported-number', `What is the first-year OBC girl fee for ${year}?`, 'OBC girls pay INR 9,99,999.', true, [fee], slots, 'Invented amount absent from all evidence.'),
    row('VD-15', 'promise', 'Will admission be guaranteed?', 'You have guaranteed admission.', true, [fee], {}, 'Promissory statement is prohibited regardless of evidence numbers.'),
  ];
}

// Positive class = an answer that must be rejected. Rates have explicit denominators.
export function rejectionMetrics(rows) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const row of rows) {
    if (typeof row.expectedReject !== 'boolean' || typeof row.rejected !== 'boolean') throw new Error('Boolean rejection labels required');
    if (row.expectedReject) row.rejected ? tp++ : fn++;
    else row.rejected ? fp++ : tn++;
  }
  return { tp, fp, tn, fn, total: rows.length,
    errorDetectionRecall: tp + fn ? tp / (tp + fn) : null,
    falseAlarmRate: fp + tn ? fp / (fp + tn) : null,
    decisionAgreement: rows.length ? (tp + tn) / rows.length : null };
}

export function evaluateVerifiers(cases, corpus) {
  const ids = new Set();
  const records = new Map(corpus.map(record => [record.id, record]));
  const rows = cases.map(item => {
    if (ids.has(item.id) || typeof item.expectedReject !== 'boolean' || !item.evidenceIds.length || item.evidenceIds.some(id => !records.has(id))) throw new Error('Invalid diagnostic case');
    ids.add(item.id);
    const evidence = item.evidenceIds.map(id => records.get(id));
    const token = verifyGeneratedAnswer(item.answer, evidence);
    const slot = verifySlotGrounding(item.answer, item.slots, evidence);
    return { ...item, methods: { token: { rejected: !token.verified, status: token.status }, slot: { rejected: !slot.verified, status: slot.status } } };
  });
  const summary = Object.fromEntries(['token', 'slot'].map(method => [method, rejectionMetrics(rows.map(row => ({ expectedReject: row.expectedReject, rejected: row.methods[method].rejected })))]));
  return { rows, summary };
}
