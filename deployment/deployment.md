# Deployment

## Deployment paths established by repository configuration

### GitHub Pages workflow

`.github/workflows/deploy.yml` defines the following automated path:

1. Trigger on a push to `main` or `master`, or through `workflow_dispatch`.
2. Check out the repository and set up Node.js 22 on `ubuntu-latest`.
3. Install packages using `npm install --legacy-peer-deps`.
4. Run `npm run build` with `VITE_BASE_PATH=/TakaSafe/`.
5. Upload `./dist` as a Pages artifact.
6. Deploy that artifact with `actions/deploy-pages@v4` to the GitHub Pages environment.

The workflow requests Pages write and OIDC token permissions and uses a `github-pages` environment. This documents the workflow definition only; GitHub Pages enablement, branch protection, environment approval rules, domain settings, workflow run results, and the live URL require manual verification in GitHub.

This workflow deploys static files. It does not start `server.ts`, the FastAPI app, a database, or a separate ML service. Whether the browser application can use all API functionality on this static hosting path is **UNKNOWN / NEEDS CONFIRMATION**.

### Surge script

`package.json` defines `npm run deploy` as `npm run build && surge ./dist takasafe-diu.surge.sh`. This is the exact declared command and target. The repository does not pin/install the Surge CLI, configure credentials, or prove that this script is the current release process. Do not treat it as a verified successful deployment procedure until CLI, account, domain, and access are checked.

## Server execution modes (available in code; hosting not established)

- Node: `npm run dev` starts `server.ts` through `tsx`; the app uses Vite middleware when `NODE_ENV` is not `production`. In production mode it serves `dist` as static content, falls back to `index.html` for extensionless paths, and listens on `0.0.0.0` using `PORT` (default 3000).
- Python: `backend/main.py` defines a FastAPI app, includes the ScamShield router, and exposes `/`, `/docs`, and the health route listed in its response. `backend/README.md` documents dependency installation and a Uvicorn command on port 8000 with reload enabled. No deployment manifest or service configuration for this backend was found.
- The root README mentions Cloud Run, but no Cloud Run service, container, or deployment configuration was found in the inspected repository. Hosting provider and actual deployed service topology are **UNKNOWN / NEEDS CONFIRMATION**.

## Prerequisites and checks

- For the Pages workflow: GitHub Actions/Pages configuration and the permissions required by the workflow must be available in the repository settings.
- For Surge: Node/npm, a compatible Surge CLI, authenticated access, and control of `takasafe-diu.surge.sh` must be confirmed manually.
- For Node or Python API hosting: choose and configure a runtime/service, provide the appropriate environment values and model artifact, and ensure network routing is configured. The project does not supply verified hosting steps for these services.
- Node health endpoint: `GET /api/scamshield/health` reports whether its model loaded. Python also has a health route referenced in `backend/main.py` and `backend/README.md`. A healthy static Pages response alone does not establish backend or model health.
- No general deployment smoke-test script, monitoring integration, or documented failure alert route was found.

## Configuration and likely operational failure points

- A wrong `VITE_BASE_PATH` can produce incorrect asset URLs on a subpath; the Pages workflow hard-codes `/TakaSafe/`.
- Missing/inaccessible model artifacts result in model-disconnected responses (Node code returns HTTP 503 for analyze; Python health/startup code reports model loading state).
- Missing `GEMINI_API_KEY` may prevent the server-side Gemini feature from operating; a hosted value is not verified.
- A static-only host does not execute Express or FastAPI endpoints. API availability and frontend-to-backend routing must be independently confirmed.
- The production Node branch expects a built `dist/` directory. Deployment order and runtime process management are not configured in this repository.
