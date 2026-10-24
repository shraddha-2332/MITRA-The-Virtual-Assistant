import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractConversationContext,
  resolveConversationalQuestion,
  askPublicWithHistory,
} from '../src/conversations.js';

test('extractConversationContext detects gender and route alongside category and branch', () => {
  const context = extractConversationContext('I am a girl looking for DSE admission in Computer Engineering');
  assert.equal(context.gender, 'girls');
  assert.equal(context.route, 'DSE');
  assert.equal(context.branch, 'Computer Engineering');
  assert.equal(context.lastTopic, 'admission');
});

test('resolveConversationalQuestion returns standalone question unchanged', () => {
  const chat = { messages: [{ type: 'user', text: 'Tell me about MITCORER Barshi' }] };
  const q = 'What is the full intake and branch list at MITCORER campus?';
  const resolved = resolveConversationalQuestion(q, chat, {});
  assert.equal(resolved, q);
});

test('resolveConversationalQuestion resolves fee follow-ups with branch context', () => {
  const chat = { messages: [{ type: 'user', text: 'Tell me about Computer Engineering' }] };
  const context = { branch: 'Computer Engineering', lastTopic: 'fees' };

  // Follow-up 1: "what are the fees?"
  const resolvedFee = resolveConversationalQuestion('what are the fees?', chat, context);
  assert.equal(resolvedFee, 'What are the engineering fees for Computer Engineering?');

  // Follow-up 2: "any concession for girls?"
  const resolvedGirls = resolveConversationalQuestion('any concession for girls?', chat, context);
  assert.equal(resolvedGirls, 'What is the engineering fee concession for girl students in Computer Engineering?');

  // Follow-up 3: "What about OBC girls?" preserves both category and gender slots
  const resolvedObcGirls = resolveConversationalQuestion('What about OBC girls?', chat, { ...context, category: 'OBC' });
  assert.equal(resolvedObcGirls, 'What is the engineering fee concession for OBC girl students in Computer Engineering?');
});

test('resolveConversationalQuestion resolves intake and cutoff follow-ups', () => {
  const chat = { messages: [{ type: 'user', text: 'Tell me about AI & Data Science' }] };
  const context = { branch: 'AI & Data Science' };

  const resolvedIntake = resolveConversationalQuestion('what is the intake?', chat, context);
  assert.equal(resolvedIntake, 'What is the intake and seat capacity for AI & Data Science?');

  const resolvedCutoff = resolveConversationalQuestion('what was the cutoff?', chat, context);
  assert.equal(resolvedCutoff, 'What was the cutoff for AI & Data Science?');
});

test('resolveConversationalQuestion resolves hostel follow-ups without confusing with academic fees', () => {
  const chat = { messages: [{ type: 'user', text: 'Tell me about the hostel facility' }] };
  const context = { lastTopic: 'hostel' };

  const resolvedMess = resolveConversationalQuestion('is mess included?', chat, context);
  assert.equal(resolvedMess, 'Hostel inquiry: is mess included?');

  const resolvedHostelFees = resolveConversationalQuestion('hostel fees?', chat, context);
  assert.equal(resolvedHostelFees, 'hostel fees?');
});

test('askPublicWithHistory maintains multi-turn context across turns', async () => {
  let recordedQuestions = [];
  const mockAnswer = async ({ question, context }) => {
    recordedQuestions.push(question);
    return {
      answer: `Answer for: ${question}`,
      source: 'Mock Source',
    };
  };

  // Turn 1: Ask about Computer Engineering
  const res1 = await askPublicWithHistory({ question: 'Tell me about Computer Engineering' }, mockAnswer);
  assert.ok(res1.conversationId);
  assert.equal(res1.context.branch, 'Computer Engineering');

  // Turn 2: Follow-up asking about fees
  const res2 = await askPublicWithHistory({
    question: 'what are the fees?',
    conversationId: res1.conversationId,
  }, mockAnswer);

  assert.equal(res2.conversationId, res1.conversationId);
  assert.ok(recordedQuestions.some((q) => q.includes('Computer Engineering')));
});

