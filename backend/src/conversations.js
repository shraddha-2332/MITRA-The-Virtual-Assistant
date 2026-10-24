import { getDb, saveDb } from './store.js';
import { badRequest, notFound } from './errors.js';
import { generateId, nowIso, pick } from './utils.js';
import { understandQuery } from './query-understanding.js';

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
  const query = understandQuery(text);
  if (query.academicYears.length === 1 && !query.invalidYears.length) {
    context.academicYear = query.academicYears[0];
  } else if (query.academicYears.length || query.invalidYears.length) {
    delete context.academicYear;
  }

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
  } else if (/\b(?:mechanical and rail(?:way)?|mechanical engineering|mechanical|rail(?:way)? engineering)\b/.test(norm)) {
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

  // Gender identification for concessions & accommodation
  if (/\b(?:girls?|female|women|ladies)\b/.test(norm)) {
    context.gender = 'girls';
  } else if (/\b(?:boys?|male|men)\b/.test(norm)) {
    context.gender = 'boys';
  }

  // Admission route
  if (/\b(?:dse|direct second|lateral entry)\b/.test(norm)) {
    context.route = 'DSE';
  } else if (/\b(?:first year|fe|freshman)\b/.test(norm)) {
    context.route = 'First Year';
  }

  // Active topic identification for conversational follow-ups
  if (/\b(?:hostel|mess|accommodation|stay|room|warden)\b/.test(norm)) {
    context.lastTopic = 'hostel';
  } else if (/\b(?:fee|fees|cost|tuition|installment|scholarship|concession)\b/.test(norm)) {
    context.lastTopic = 'fees';
  } else if (/\b(?:placement|recruiter|package|salary|internship|job|career)\b/.test(norm)) {
    context.lastTopic = 'placement';
  } else if (/\b(?:admission|cap|cutoff|eligibility|documents?|apply|seat)\b/.test(norm)) {
    context.lastTopic = 'admission';
  } else if (/\b(?:lab|laborator|workshop|infrastructure|campus|library)\b/.test(norm)) {
    context.lastTopic = 'facilities';
  }

  return context;
}

export function resolveConversationalQuestion(question, chat, context = {}) {
  const norm = String(question || '').normalize('NFKC').toLowerCase().trim();
  if (!chat || !Array.isArray(chat.messages) || chat.messages.length === 0) {
    return question;
  }
  // If the query is already an explicit, comprehensive college inquiry, keep as-is.
  if (/\b(?:mitcorer|barshi|campus|college)\b/.test(norm) && norm.split(/\s+/).length > 8) {
    return question;
  }

  const isBareOrPronoun = /\b(?:it|this|that|there|they|them|its|same|tell me more|is it)\b/.test(norm)
    || /^(?:and|what about|how about|any|for)\b/.test(norm)
    || norm.split(/\s+/).length <= 4;

  // Explicit exclusions must reach the scope parser unchanged; do not reuse a negated profile.
  if (/\b(?:not|no|except|excluding|instead)\b/.test(norm)) return question;

  // 1. Hostel & mess follow-ups
  if (context.lastTopic === 'hostel' && !/\b(?:hostel|room)\b/.test(norm)) {
    return `Hostel inquiry: ${question}`;
  }

  // 2. Fee follow-ups
  if (!/\b(?:hostel|room|mess)\b/.test(norm) && (isBareOrPronoun && context.lastTopic === 'fees' || /\b(?:fee|fees|cost|tuition|charges|shulka|concession)\b/.test(norm))) {
    // Enrich the original question instead of replacing qualifiers such as DSE,
    // academic year, semester, comparison, or installment requests.
    const query = understandQuery(question);
    const additions = [];
    if (!/\b(?:fee|fees|cost|tuition|charges|shulka|concession)\b/.test(norm)) additions.push('engineering fees');
    if (!query.category.positive.length && !query.category.excluded.length && context.category) additions.push(context.category);
    if (!query.gender.positive.length && !query.gender.excluded.length && context.gender) additions.push(context.gender);
    if (!query.branch.positive.length && !query.branch.excluded.length && context.branch) additions.push(context.branch);
    if (!query.route.positive.length && !query.route.excluded.length && !/\bsecond year\b/.test(norm) && context.route) additions.push(context.route);
    if (!query.academicYears.length && !query.invalidYears.length && context.academicYear) additions.push(context.academicYear);
    return additions.length ? `${question} (${additions.join(' ')})` : question;
  }

  // 3. Intake / seats follow-ups (e.g. "what is the intake?", "how many seats?")
  if (/\b(?:intake|seats?|seat matrix|capacity)\b/.test(norm) && context.branch && !/\b(?:computer|mechanical|civil|railway|ai|data science|entc|electronics)\b/.test(norm)) {
    return `What is the intake and seat capacity for ${context.branch}?`;
  }

  // 4. Cutoff follow-ups (e.g. "what was the cutoff?", "last year cutoff?")
  if (/\b(?:cutoff|cut off|merit|percentile|rank)\b/.test(norm) && context.branch && !/\b(?:computer|mechanical|civil|railway|ai|data science|entc|electronics)\b/.test(norm)) {
    return `What was the cutoff for ${context.branch}?`;
  }

  // 5. Placement follow-ups (e.g. "highest package?", "top recruiters?", "average salary?")
  if (context.lastTopic === 'placement' && !/\b(?:placement|package|recruiter)\b/.test(norm)) {
    if (context.branch && !/\b(?:computer|mechanical|civil|railway|ai|data science|entc|electronics)\b/.test(norm)) {
      return `Placement inquiry for ${context.branch}: ${question}`;
    }
    return `Placement inquiry: ${question}`;
  }

  // 6. Branch context fallback for short follow-ups
  if (context.branch && isBareOrPronoun && !/\b(?:computer|mechanical|civil|railway|ai|data science|entc|electronics)\b/.test(norm)) {
    return `${question} for ${context.branch}`;
  }

  return question;
}

export async function askWithHistory(body, user, answerQuestion) {
  if (typeof body.question !== 'string' || !body.question.trim() || body.question.trim().length > 1000) {
    throw badRequest('Enter a question of up to 1000 characters.');
  }
  const question = body.question.trim();
  const chat = body.conversationId ? getConversation(body.conversationId, user) : null;
  if (chat && chat.messages.length >= 200) throw badRequest('This conversation is full. Start a new chat to continue.');
  const updatedContext = extractConversationContext(question, chat?.context || {});
  const contextualQuestion = resolveConversationalQuestion(question, chat, updatedContext);
  const answer = await answerQuestion({ question: contextualQuestion, language: body.language, context: updatedContext }, user);
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

export async function askPublicWithHistory(body, answerQuestion) {
  if (typeof body?.question !== 'string' || !body.question.trim() || body.question.trim().length > 1000) {
    throw badRequest('Enter a question of up to 1000 characters.');
  }
  const question = body.question.trim();
  const db = getDb();
  db.conversations = db.conversations || [];

  const conversationId = typeof body.conversationId === 'string' && body.conversationId.trim()
    ? body.conversationId.trim()
    : null;

  const chat = conversationId
    ? db.conversations.find((item) => item.id === conversationId && item.ownerId === 'public')
    : null;

  if (chat && chat.messages.length >= 200) throw badRequest('This conversation is full. Start a new chat to continue.');

  const updatedContext = extractConversationContext(question, chat?.context || {});
  const contextualQuestion = resolveConversationalQuestion(question, chat, updatedContext);

  const answer = await answerQuestion({
    question: contextualQuestion,
    language: body.language,
    context: updatedContext,
  }, null);

  const now = nowIso();
  const conversation = chat || {
    id: generateId('CHAT'),
    ownerId: 'public',
    title: question.replace(/\s+/g, ' ').slice(0, 80),
    createdAt: now,
    updatedAt: now,
    messages: [],
    context: updatedContext,
  };

  conversation.context = updatedContext;
  conversation.messages.push(
    { id: generateId('MSG'), type: 'user', text: question, createdAt: now },
    {
      id: generateId('MSG'),
      type: 'assistant',
      text: answer.answer,
      ...pick(answer, ['source', 'sourceUrl', 'officialLinks', 'next', 'actionView', 'actionLabel', 'sections', 'evidence', 'requestedLanguage', 'responseLanguage', 'localizationStatus', 'languageReviewStatus', 'suggestions', 'escalation', 'model']),
      createdAt: now,
    },
  );
  conversation.updatedAt = now;

  if (!chat) {
    db.conversations.push(conversation);
    // Keep max 200 public conversations to bound storage
    const publicChats = db.conversations.filter(c => c.ownerId === 'public');
    if (publicChats.length > 200) {
      const oldestId = publicChats[0].id;
      db.conversations = db.conversations.filter(c => c.id !== oldestId);
    }
  }
  saveDb();

  return {
    ...answer,
    conversationId: conversation.id,
    context: conversation.context,
  };
}
