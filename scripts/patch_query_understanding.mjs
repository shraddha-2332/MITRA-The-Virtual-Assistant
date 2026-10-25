import fs from 'fs';

const filePath = 'backend/src/query-understanding.js';
let code = fs.readFileSync(filePath, 'utf8');

const oldFn = `export function isEmploymentQuery(text) {
  const norm = String(text || '').normalize('NFKC').toLowerCase();
  const hasJobTerms = /\\b(?:hiring|recruitment|recruiting|vacancy|vacancies|job openings?|work with us|careers? at (?:mitcorer|mit|the college)|faculty recruitment|staff recruitment|teacher recruitment)\\b/i.test(norm)
    || /\\b(?:भरती|नोकरीसाठी अर्ज|रिक्त\\s*जागा|प्राध्यापक\\s*भरती|शिक्षक\\s*भरती|कर्मचारी\\s*भरती|नौकरी\\s*के\\s*लिए|शिक्षक\\s*भर्ती)\\b/iu.test(norm);
  const hasStaffRole = /\\b(?:faculty|teacher|teachers|professor|professors|staff|teaching|non[- ]teaching|lecturer|lecturers|assistant professor|instructor|clerk|peon|employee|employees)\\b/i.test(norm);
  const hasEmploymentAction = /\\b(?:apply for (?:a )?(?:job|post)|apply for teaching|apply for faculty|apply for staff|how to apply for.*(?:job|post|vacancy)|job application|staff hiring|faculty hiring|teacher hiring|recruitment process of (?:faculty|staff|teachers?)|staff recruitment)\\b/i.test(norm);

  if (hasEmploymentAction) return true;
  if (hasJobTerms && hasStaffRole) return true;
  if (/\\b(?:staff|faculty|teacher|professor)\\s+(?:hiring|recruitment|vacancy|vacancies|jobs?|openings?)\\b/i.test(norm)) return true;
  if (/\\b(?:hiring|recruitment|vacancy|vacancies|jobs?|openings?)\\s+(?:for|of|in)\\s+(?:staff|faculty|teacher|professor|assistant professor)\\b/i.test(norm)) return true;
  if (/^(?:staff hiring|faculty recruitment|teacher recruitment|job openings for teachers|careers at mitcorer|careers at mit)$/i.test(norm.trim())) return true;
  return false;
}`;

const newFn = `export function isEmploymentQuery(text) {
  const norm = String(text || '').normalize('NFKC').toLowerCase();
  const hasDevanagariJob = /(?:भरती|भर्ती|नोकरीसाठी|रिक्त\\s*जागा|नोकरी\\s*के\\s*लिए|रिक्त\\s*पदों|अध्यापक|कर्मचारी\\s*भरती|शिक्षक\\s*भरती|शिक्षक\\s*भर्ती|प्राध्यापक\\s*भरती)/u.test(norm);
  if (hasDevanagariJob) return true;

  const hasJobTerms = /\\b(?:hiring|recruitment|recruiting|vacancy|vacancies|job openings?|work with us|careers? at (?:mitcorer|mit|the college)|faculty recruitment|staff recruitment|teacher recruitment)\\b/i.test(norm);
  const hasStaffRole = /\\b(?:faculty|teacher|teachers|professor|professors|staff|teaching|non[- ]teaching|lecturer|lecturers|assistant professor|instructor|clerk|peon|employee|employees)\\b/i.test(norm);
  const hasEmploymentAction = /\\b(?:apply for (?:a )?(?:job|post)|apply for teaching|apply for faculty|apply for staff|how to apply for.*(?:job|post|vacancy)|job application|staff hiring|faculty hiring|teacher hiring|recruitment process of (?:faculty|staff|teachers?)|staff recruitment)\\b/i.test(norm);

  if (hasEmploymentAction) return true;
  if (hasJobTerms && hasStaffRole) return true;
  if (/\\b(?:staff|faculty|teacher|professor)\\s+(?:hiring|recruitment|vacancy|vacancies|jobs?|openings?)\\b/i.test(norm)) return true;
  if (/\\b(?:hiring|recruitment|vacancy|vacancies|jobs?|openings?)\\s+(?:for|of|in)\\s+(?:staff|faculty|teacher|professor|assistant professor)\\b/i.test(norm)) return true;
  if (/^(?:staff hiring|faculty recruitment|teacher recruitment|job openings for teachers|careers at mitcorer|careers at mit)$/i.test(norm.trim())) return true;
  return false;
}`;

const normCode = code.replace(/\r\n/g, '\n');
const normOld = oldFn.replace(/\r\n/g, '\n');
const normNew = newFn.replace(/\r\n/g, '\n');

if (!normCode.includes(normOld)) {
  console.error('Target function not found');
  process.exit(1);
}

const isCRLF = code.includes('\r\n');
const replaced = normCode.replace(normOld, normNew);
fs.writeFileSync(filePath, isCRLF ? replaced.replace(/\n/g, '\r\n') : replaced, 'utf8');
console.log('Updated isEmploymentQuery in query-understanding.js successfully');

