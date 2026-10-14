import { getDb, saveDb } from './store.js';
import { badRequest, notFound } from './errors.js';
import { generateId, nowIso, pick } from './utils.js';

const summary = (chat) => pick(chat, ['id', 'title', 'createdAt', 'updatedAt']);

export function getConversation(id, user) {
  const chat = getDb().conversations.find((item) => item.id === id && item.ownerId === user.id);
  if (!chat) throw notFound('Conversation not found.');
  return chat;
}

export function listConversations(user, offsetValue) {
  const offset = Number(offsetValue || 0);
  if (!Number.isSafeInteger(offset) || offset < 0) throw badRequest('Invalid history offset.');
  const chats = getDb().conversations.filter((item) => item.ownerId === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { items: chats.slice(offset, offset + 30).map(summary), hasMore: chats.length > offset + 30 };
}

export function extractConversationContext(text, existingContext = {}) {
  const norm = String(text || '').normalize('NFKC').toLocaleLowerCase();
  const context = { ...(existingContext || {}) };

  // Category identification
  if (/\b(?:sc|scheduled caste)\b/.test(norm)) {
    context.category = 'SC';
  } else if (/\b(?:st|scheduled tribe)\b/.test(norm)) {
    context.category = 'ST';
  } else if (/\b(?:vjnt|vj\/?nt|nt-[abcd]|nt[abcd])\b/.test(norm)) {
    context.category = 'VJNT';
  } else if (/\b(?:sbc|special backward class)\b/.test(norm)) {
    context.category = 'SBC';
  } else if (/\b(?:obc|other backward class)\b/.test(norm)) {
    context.category = 'OBC';
  } else if (/\b(?:ebc|ews|economically weaker section)\b/.test(norm)) {
    context.category = 'EWS';
  } else if (/\b(?:open category|general category)\b/.test(norm)) {
    context.category = 'Open';
  }

  // Branch preference
  if (/\b(?:computer engineering|computer science|cse)\b/.test(norm)) {
    context.branch = 'Computer Engineering';
  } else if (/\b(?:mechanical and rail|railway engineering|railway|mechanical)\b/.test(norm)) {
    context.branch = 'Mechanical & Rail Engineering';
  } else if (/\b(?:ai & ds|ai and ds|artificial intelligence|aids)\b/.test(norm)) {
    context.branch = 'AI & Data Science';
  } else if (/\b(?:civil engineering|civil)\b/.test(norm)) {
    context.branch = 'Civil Engineering';
  } else if (/\b(?:electronics and telecommunication|entc|electronics)\b/.test(norm)) {
    context.branch = 'Electronics & Telecommunication';
  }

  // Quota preference
  if (/\b(?:tfws|tuition fee waiver)\b/.test(norm)) {
    context.quota = 'TFWS';
  } else if (/\b(?:cap round|cap seats?)\b/.test(norm)) {
    context.quota = 'CAP';
  } else if (/\b(?:management quota|institute level|ils)\b/.test(norm)) {
    context.quota = 'Institute Level';
  }

  return context;
}

export async function askWithHistory(body, user, answerQuestion) {
  if (typeof body.question !== 'string' || !body.question.trim() || body.question.trim().length > 1000) {
    throw badRequest('Enter a question of up to 1000 characters.');
  }
  const question = body.question.trim();
  const chat = body.conversationId ? getConversation(body.conversationId, user) : null;
  if (chat && chat.messages.length >= 200) throw badRequest('This conversation is full. Start a new chat to continue.');
  const updatedContext = extractConversationContext(question, chat?.context || {});
  const answer = await answerQuestion({ question, language: body.language, context: updatedContext }, user);
  const now = nowIso();
  const conversation = chat || {
    id: generateId('CHAT'), ownerId: user.id, title: question.replace(/\s+/g, ' ').slice(0, 80),
    createdAt: now, updatedAt: now, messages: [], context: updatedContext,
  };
  conversation.context = updatedContext;
  conversation.messages.push(
    { id: generateId('MSG'), type: 'user', text: question, createdAt: now },
    { id: generateId('MSG'), type: 'assistant', text: answer.answer, ...pick(answer, ['source', 'sourceUrl', 'officialLinks', 'next', 'actionView', 'actionLabel', 'sections', 'evidence', 'requestedLanguage', 'responseLanguage', 'localizationStatus', 'languageReviewStatus', 'suggestions', 'escalation']), createdAt: now },
  );
  conversation.updatedAt = now;
  if (!chat) getDb().conversations.push(conversation);
  saveDb();
  return { conversation: { ...summary(conversation), messages: conversation.messages, context: conversation.context } };
}
