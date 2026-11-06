# KRIVA, production deployment

Static HTML on Vercel, with one serverless function (`api/inquiry.js`). Pushing to `main` deploys production automatically.

## Before any production deploy
Run `docs/GO-LIVE-CHECKLIST.md`. Do not ship until form delivery passes.

## Local preview
`npm run preview`, then http://localhost:5177/

## Checks
`npm run qa:links`, `node _qa_journey.cjs`, `PORT=5177 node _qa_all_routes.cjs`

## After changing shared CSS
`npm run build:home-css` rebuilds the homepage bundle. Bump the `?v=` value on anything changed under `shared/`, because it is cached for a day.
