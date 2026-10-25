// Offline operator command: stop the backend first and take a verified backup.
import { config } from '../src/config.js';
import { getDb, saveDb, closeDb } from '../src/store.js';
import { hashPassword } from '../src/auth.js';
import { generateId, nowIso } from '../src/utils.js';
const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 12) throw new Error('Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 12 characters.');
try {
  const db = getDb();
  let user = db.users.find(item => item.email.toLowerCase() === email);
  if (user && user.role !== 'admin') throw new Error('An account with that email has a different role; it will not be silently promoted.');
  if (!user) { user = { id: generateId('USR'), email, role: 'admin', createdAt: nowIso() }; db.users.push(user); }
  user.name = process.env.ADMIN_NAME || 'Administrator';
  user.passwordHash = hashPassword(password);
  for (const session of db.refreshTokens || []) if (session.userId === user.id) session.revoked = true;
  saveDb();
  console.log('Administrator provisioned with a unique password; existing refresh sessions revoked.');
} finally { closeDb(); }
