# Deployment

[← Build](build.md) · [Rollback →](rollback.md)

> [!IMPORTANT]
> The repository defines deployable paths, but does not identify the currently active production host. Confirm the live release path and backend topology before treating these instructions as an operational runbook.

## GitHub Pages workflow

`.github/workflows/deploy.yml` defines this sequence:

1. Trigger on a push to `main` or `master`, or a manual `workflow_dispatch`.
2. Check out the repository and set up Node.js 22 on `ubuntu-latest`.
3. Install dependencies with `npm install --legacy-peer-deps`.
4. Run `npm run build` with `VITE_BASE_PATH=/TakaSafe/`.
5. Upload `./dist` as a Pages artifact.
6. Deploy with `actions/deploy-pages@v4` to the `github-pages` environment.

The workflow requests Pages write and OIDC token permissions. Repository settings, Pages enablement, branch protection, environment approvals, custom domain, successful runs, and live URL require manual verification in GitHub.

> [!WARNING]
> This workflow deploys static files. It does **not** start `server.ts`, FastAPI, a database, or a separate ML service. Whether every frontend API feature works on this static hosting path is **UNKNOWN / NEEDS CONFIRMATION**.

## Surge script

`package.json` declares:

```sh
npm run deploy
```

That script builds and invokes `surge ./dist takasafe-diu.surge.sh`. The repository does not install or configure the Surge CLI, credentials, or domain. It also does not establish that Surge is the current release process. Verify account access, CLI, and hostname before relying on this path.

## Server modes available in code

| Service | Verified behavior | Hosting status |
|---|---|---|
| **Node / Express** | `npm run dev` starts `server.ts` through `tsx`; non-production mode uses Vite middleware. Production mode serves `dist`, falls back to `index.html` for extensionless paths, and listens on `0.0.0.0` at `PORT` (default `3000`). | Runtime hosting and process management are not configured here. |
| **Python / FastAPI** | `backend/main.py` includes the ScamShield router and defines `/`, `/docs`, and a health route. `backend/README.md` documents Uvicorn on port `8000` with reload enabled. | No deployment manifest or hosted service configuration found. |

The root README mentions Cloud Run, but no Cloud Run service, container, or deployment configuration was found. Actual hosting provider and service topology are **UNKNOWN / NEEDS CONFIRMATION**.

## Prerequisites and verification

- **Pages:** Check GitHub Actions and Pages configuration, workflow permissions, and the target URL.
- **Surge:** Confirm Node/npm, compatible Surge CLI, authenticated account access, and control of `takasafe-diu.surge.sh`.
- **Node or Python API:** Select and configure a runtime, supply required environment values and model files, and verify routing. The repository does not provide a verified hosting procedure for these services.
- **Health:** Node `GET /api/scamshield/health` reports model load status. Python exposes a health route referenced by `backend/main.py` and `backend/README.md`. A successful static page response does not establish API or model health.
- **Operations:** No general deployment smoke-test script, monitoring integration, or documented failure alert route was found.

## Common failure points visible in the project

| Symptom or risk | Project-specific detail |
|---|---|
| Assets fail on a subpath | `VITE_BASE_PATH` must match the deployed URL mount; Pages currently hard-codes `/TakaSafe/`. |
| Model unavailable | Missing/inaccessible model files lead to a model-disconnected state. Node's analyze route returns HTTP 503 when its model is not loaded. |
| Gemini integration unavailable | `GEMINI_API_KEY` is read by the Node server; a hosted value is not verified. |
| API calls fail on static hosting | A static host does not execute Express or FastAPI. Backend availability and browser-to-backend routing must be confirmed separately. |
| Node production server cannot serve app | Its production branch expects a built `dist/` directory. Deployment order and process management are not configured here. |

