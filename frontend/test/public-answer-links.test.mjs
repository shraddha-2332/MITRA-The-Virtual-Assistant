import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAnswerLinks, resolvePublicSourceUrl } from '../src/public-answer-links.mjs';

test('old library links in existing answers are corrected and deduplicated', () => {
  const old = 'https://www.mitcorer.edu.in/about-lib-details.html';
  const current = 'https://mitcorer.edu.in/about-lib-details.php';
  assert.deepEqual(publicAnswerLinks({ sourceUrl: old, officialLinks: [{ label: 'Library', url: current }] }), [{ label: 'Official source', url: current }]);
  assert.equal(resolvePublicSourceUrl('http://mitcorer.edu.in/about-lib-details.html'), current);
  assert.equal(resolvePublicSourceUrl('https://example.com/about-lib-details.html'), 'https://example.com/about-lib-details.html');
});
const passage = 'First Year Engineering fees for AY 2026-27 include Open or OMS total INR 1,05,000, Open EBC EWS OBC SEBC boys INR 61,109, girls INR 17,217, VJNT SBC TFWS INR 17,217, and SC ST INR 8,000. Direct Second Year fees include Open or OMS INR 98,000, Open EBC EWS OBC SEBC boys INR 58,181, girls INR 18,362, VJNT SBC TFWS INR 18,362, and SC ST INR 10,000.';
test('provided fee snapshots are route-specific and disappear when maintained values or year change', () => {
  const message = { text: 'Direct Second Year fees for AY 2026-27', evidence: [{ id: 'KB-2', passage: { text: passage } }] };
  const assets = { firstYear: '/fy.png', directSecondYear: '/dse.png' };
  assert.deepEqual(publicAnswerLinks(message, assets).map(link => link.url), ['/dse.png']);
  for (const changed of [passage.replace('98,000', '99,001'), passage.replace('2026-27', '2027-28')]) {
    assert.deepEqual(publicAnswerLinks({ ...message, evidence: [{ id: 'KB-2', passage: { text: changed } }] }, assets), []);
  }
  assert.deepEqual(publicAnswerLinks({ ...message, text: 'No verified record' }, assets), []);
});
test('source links are deduplicated without replacing maintainer URLs', () => {
  assert.deepEqual(publicAnswerLinks({ sourceUrl: 'https://mitcorer.edu.in/contact.php', officialLinks: [{ label: 'Contact', url: 'https://mitcorer.edu.in/contact.php' }] }), [{ label: 'Official source', url: 'https://mitcorer.edu.in/contact.php' }]);
});

test('compound fee answers retain the separately provided hostel notice', () => {
  const message = { text: passage + ' Hostel and mess fees', evidence: [{ id: 'KB-2', passage: { text: passage } }, { id: 'KB-3', passage: { text: 'Hostel fee structure for AY 2026-27 includes hostel fees INR 35,000 and refundable hostel deposit INR 5,000, total INR 40,000. Mess fees per year are INR 42,000.' } }] };
  assert.deepEqual(publicAnswerLinks(message, { firstYear: '/fy.png', directSecondYear: '/dse.png', hostel: '/hostel.png' }).map(link => link.url), ['/fy.png', '/dse.png', '/hostel.png']);
});
