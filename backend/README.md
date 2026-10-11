# CampusGuard Backend

Zero-dependency Node.js API for the CampusGuard second-review backend foundation.

## Run

```bash
cd backend
npm run dev
```

Default URL: `http://127.0.0.1:4000`

## Demo Accounts

All seed users use password `campusguard`.

- `applicant@example.com`
- `parent@example.com`
- `staff@mitcorer.edu.in`
- `admin@mitcorer.edu.in`

## API Summary

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/me`
- `GET /api/inquiries`
- `POST /api/inquiries`
- `PATCH /api/inquiries/:id/status`
- `GET /api/documents`
- `POST /api/documents`
- `PATCH /api/documents/:id/status`
- `DELETE /api/documents/:id`
- `GET /api/content`
- `POST /api/content`
- `PATCH /api/content/:id`
- `GET /api/reports`

## Current Scope

This backend provides SQLite-backed persistence, password hashing, signed short-lived access tokens, refresh-token rotation, backend RBAC, audit logs, upload validation, and staff/admin workflows. Official sources flow through an admin review and publish gate; only published source chunks are available to retrieval. It remains a college-project deployment baseline rather than a completed institutional production service: malware scanning, object storage, normalized relational tables, OCR for scanned material, and managed secret/session infrastructure still require deployment-specific work.

## Assistant Answers and Gemini

The assistant retrieves published MITCORER knowledge and uses direct verified answers for admission rules, fees, programmes, profile questions, and facilities. For other questions with retrieved evidence, Gemini can write a concise response. If the model is unavailable, the server returns the verified record.

Set these variables in `backend/.env`:

```bash
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
```

This is retrieval with generation, not model training. The key stays on the backend. Review the linked official source for consequential admission decisions.
