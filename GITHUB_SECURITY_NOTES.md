# GitHub publication notes

This repository is a sanitized **concept/prototype** copy. The original local SQLite database, token-signing secret, Python virtual environment, and compiled caches were excluded.

## Before publishing
- Check `git status` and `git ls-files` for unexpected files before pushing.
- Never commit `data/.secret`, `data/ibluteam.db`, `.env`, real sensor keys, access tokens, or sensitive event logs.
- If any credential has previously been committed or shared, **rotate it**. Deleting the file alone does not revoke credentials or remove Git history.
- The application generates a new local signing secret and database when run. Set a strong `IBT_ADMIN_PASSWORD` before first startup.
- The honeypot CSV export endpoint now requires a logged-in user.
- Browser authentication currently uses `localStorage`; this remains a security consideration if deploying publicly. Review XSS defenses and session architecture before exposing the app to the internet.
- This is a static review and sanitization, **not** a complete security audit. Keep the app local while evaluating its security.

## Running locally
Follow `README.md`. Do not commit the database or generated secrets after starting.
