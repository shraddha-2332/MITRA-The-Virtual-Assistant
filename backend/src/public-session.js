import crypto from 'node:crypto';
import { config } from './config.js';

export const publicSessionCookieName = 'mitra_public_session';
export function readPublicSession(req) {
  const value = String(req.headers.cookie || '').split(';').map(part => part.trim())
    .find(part => part.startsWith(`${publicSessionCookieName}=`))?.slice(publicSessionCookieName.length + 1);
  return /^[a-f0-9]{64}$/.test(value || '') ? value : null;
}
export function createPublicSession() { return crypto.randomBytes(32).toString('hex'); }
export function publicSessionHash(token) {
  if (!/^[a-f0-9]{64}$/.test(token || '')) throw new Error('A valid public session is required.');
  return crypto.createHash('sha256').update(token).digest('hex');
}
export function publicSessionCookie(token) {
  return `${publicSessionCookieName}=${token}; HttpOnly; SameSite=Strict; Path=/api/public-assistant; Max-Age=${Math.floor(config.publicConversationTtlMs / 1000)}${config.nodeEnv === 'production' ? '; Secure' : ''}`;
}
