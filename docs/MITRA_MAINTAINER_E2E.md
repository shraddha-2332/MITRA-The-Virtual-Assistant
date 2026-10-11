# Maintainer browser workflow and restart verification

Verified: 9 October 2026, installed Chrome, development frontend, isolated backend process and temporary SQLite database.

Current UI: the user subsequently requested removal of the public **Maintainer sign in** link. The footer is restored to its original text. The maintainer test now authenticates a synthetic fixture through the existing API and restores the workspace with the normal browser cookie flow. Public login-screen verification is deferred; editing, conflict, translation and restart checks remain active. The login-entry findings below describe the earlier increment.

## Assessment and fixes

Backend tests covered revisioned editing and storage but not the maintainer's full browser journey. Actual browser verification exposed two issues:

**Login was unreachable.** The staff-login state existed, but the public widget never opened it. The public assistant footer now has **Maintainer sign in**, leading to the existing login form. Server-side role checks remain authoritative.

**Browser reload lost the authenticated workspace.** React Strict Mode repeats session restoration in development. Two refresh requests attempted to rotate the same refresh token; one effect was cleaned up while the other request could fail after rotation. The refresh API now shares only its in-flight request, clearing it after success or failure. Later calls get fresh session data. Strict Mode and backend token rotation remain enabled. Completed identities and access tokens are not cached by this helper.

## Implementation

App.jsx adds the login action; api.js uses `refresh-session.mjs` for request sharing; index.css styles the footer button. `verify-maintainer.mjs` controls Chrome and real API requests. `maintainer-test-server.mjs` runs a child backend with its own temporary database and supports an actual separate-process restart. Two frontend unit tests cover concurrent refresh, later requests and failure recovery.

## Validation

The complete maintainer browser journey passed:

1. No public login link; API wrong-password rejection and administrator fixture login, followed by browser workspace restoration.
2. Structured first-year fee edit, deliberately failed save, draft preservation and successful retry.
3. Real concurrent API change, browser 409 revision conflict and draft preservation.
4. Authenticated workspace restoration after browser reload.
5. Translation-review checkbox enforcement and use of a synthetic fixture translation in public chat.
6. Source-text edit without renewed review, followed by explicit English fallback for the stale Hindi translation.
7. Full child-process shutdown and a new backend process against the same SQLite file; edited fee, passage hash and translation staleness persist.
8. Administrator restoration after restart; record retirement through the UI; no fee evidence returned publicly afterward.
9. Anonymous edit rejected with 401 and staff edit rejected with 403; no uncaught browser errors.

Public browser checks also passed: 14 native-language journeys, evidence expansion, keyboard operation, safe literal passage rendering, network recovery, English override and mobile overflow. Frontend unit tests: **5/5 passed**. Lint and production build passed.

The fixture review checkbox does not grant production speaker approval. These are functional checks, not answer-accuracy measurements.

## Reproduce

From `frontend`:

```powershell
npm.cmd ci
npm.cmd run test:maintainer-browser
npm.cmd run test:language-browser
node --test test/*.test.mjs
npm.cmd run lint
npm.cmd run build
```

Chrome must be installed; alternatively set `$env:MITRA_BROWSER_CHANNEL = 'msedge'` for installed Edge. The harness starts its own loopback servers and database. Existing application servers need not be stopped. Browser, child process, frontend server and temporary storage are closed afterward. No `.env`, maintained database, paid model API, Git push or deployment is used.

## Limits and next step

Cross-tab refresh coordination, production HTTPS/cookies, live deployment and production credential provisioning are not verified here. Existing seeded demo accounts and the demo account chooser still need production hardening. Independent relevance and competent-speaker judgments remain unverified.

Next: remove reliance on demo credentials for production initialization and verify production environment/session configuration before deployment work.
