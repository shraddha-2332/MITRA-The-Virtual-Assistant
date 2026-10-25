import fs from 'fs';

const filePath = 'backend/src/server.js';
let code = fs.readFileSync(filePath, 'utf8');

const oldSnippet = `      escalation: {
        available: true,
        reason: 'UNVERIFIED_INFORMATION',
        message: 'This question does not have a verified published record. You can escalate directly to our human admissions counselors.',
        helplines: [
          { label: 'Admissions Office Desk 1', number: '+91 84599 67882', tel: '+918459967882' },
          { label: 'Admissions Office Desk 2', number: '+91 86696 62106', tel: '+918669662106' },
        ],
        email: 'info.mitcorer@mitpune.edu.in',
        officeHours: 'Monday to Saturday, 9:30 AM to 5:30 PM IST',
        actionLabel: 'Escalate to Admissions Staff',
      },`;

const newSnippet = `      escalation: {
        available: true,
        reason: 'UNVERIFIED_INFORMATION',
        department: 'administrative_office',
        message: 'Staff recruitment, faculty vacancies, and employment inquiries are handled directly by the Administrative Office and Principal Desk. MITRA does not maintain live staff vacancy notices.',
        helplines: [
          { label: 'Administrative Office', number: '02184-222222', tel: '02184222222' },
          { label: 'Principal Office Desk', number: '02184-222223', tel: '02184222223' },
        ],
        email: 'office@mitcorer.edu.in',
        officeHours: 'Monday to Saturday, 9:30 AM to 5:30 PM IST',
        actionLabel: 'Escalate to Administrative Office',
      },`;

const normCode = code.replace(/\r\n/g, '\n');
const normOld = oldSnippet.replace(/\r\n/g, '\n');
const normNew = newSnippet.replace(/\r\n/g, '\n');

if (!normCode.includes(normOld)) {
  console.error('Target not found in server.js');
  process.exit(1);
}

const isCRLF = code.includes('\r\n');
let replaced = normCode.replace(normOld, normNew);

// Also let's check lines 1892+ if unverified has isEmployment check
const oldGeneralEscalation = `  if (isUnverified) {
    groundedAnswer.escalation = {
      available: true,
      reason: 'UNVERIFIED_INFORMATION',
      message: 'This question does not have a verified published record. You can escalate directly to our human admissions counselors.',
      helplines: [
        { label: 'Admissions Office Desk 1', number: '+91 84599 67882', tel: '+918459967882' },
        { label: 'Admissions Office Desk 2', number: '+91 86696 62106', tel: '+918669662106' },
      ],
      email: 'info.mitcorer@mitpune.edu.in',
      officeHours: 'Monday to Saturday, 9:30 AM to 5:30 PM IST',
      actionLabel: 'Escalate to Admissions Staff',
    };
  }`;

const newGeneralEscalation = `  if (isUnverified) {
    const isEmployment = isEmploymentQuery(question) || isEmploymentQuery(normalized);
    if (isEmployment) {
      groundedAnswer.escalation = {
        available: true,
        reason: 'UNVERIFIED_INFORMATION',
        department: 'administrative_office',
        message: 'Staff recruitment, faculty vacancies, and employment inquiries are handled directly by the Administrative Office and Principal Desk. MITRA does not maintain live staff vacancy notices.',
        helplines: [
          { label: 'Administrative Office', number: '02184-222222', tel: '02184222222' },
          { label: 'Principal Office Desk', number: '02184-222223', tel: '02184222223' },
        ],
        email: 'office@mitcorer.edu.in',
        officeHours: 'Monday to Saturday, 9:30 AM to 5:30 PM IST',
        actionLabel: 'Escalate to Administrative Office',
      };
    } else {
      groundedAnswer.escalation = {
        available: true,
        reason: 'UNVERIFIED_INFORMATION',
        message: 'This question does not have a verified published record. You can escalate directly to our human admissions counselors.',
        helplines: [
          { label: 'Admissions Office Desk 1', number: '+91 84599 67882', tel: '+918459967882' },
          { label: 'Admissions Office Desk 2', number: '+91 86696 62106', tel: '+918669662106' },
        ],
        email: 'info.mitcorer@mitpune.edu.in',
        officeHours: 'Monday to Saturday, 9:30 AM to 5:30 PM IST',
        actionLabel: 'Escalate to Admissions Staff',
      };
    }
  }`;

if (replaced.includes(oldGeneralEscalation)) {
  replaced = replaced.replace(oldGeneralEscalation, newGeneralEscalation);
}

fs.writeFileSync(filePath, isCRLF ? replaced.replace(/\n/g, '\r\n') : replaced, 'utf8');
console.log('Successfully updated backend/src/server.js');

