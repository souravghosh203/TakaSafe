# Environments and configuration

## Verified environments

| Environment | What the repository establishes | Status |
|---|---|---|
| Local development | `npm run dev` starts `server.ts`; it runs Express with Vite middleware unless `NODE_ENV=production`. The Vite dev server is configured for `0.0.0.0:3000`. | Verified in `package.json`, `server.ts`, and `vite.config.ts`. |
| GitHub Pages build/deployment | `.github/workflows/deploy.yml` builds on pushes to `main` or `master` and on manual dispatch, with `VITE_BASE_PATH=/TakaSafe/`, then publishes `dist` through GitHub Pages. | Workflow is present. Repository configuration, successful runs, and the currently active Pages site are not verified here. |
| Surge deployment | `npm run deploy` builds and invokes `surge ./dist takasafe-diu.surge.sh`. | Script is present. Surge CLI availability, credentials, domain ownership, and whether this is a used production environment are unknown. |
| Staging / production | The code has a `NODE_ENV=production` branch that serves `dist` from the Express process. The README also mentions Cloud Run. | Actual hosted Node/Python services, staging environment, production topology, and relationship to GitHub Pages or Surge are **UNKNOWN / NEEDS CONFIRMATION**. README architecture statements are not proof of deployed infrastructure. |

## Environment variables found in the project

| Variable | Purpose and default | Where used |
|---|---|---|
| `VITE_BASE_PATH` | Vite asset base path; defaults to `/`. GitHub Pages workflow sets `/TakaSafe/`. | `vite.config.ts`; `.github/workflows/deploy.yml` |
| `PORT` | Node Express listener port; defaults to `3000`. Python's `backend.main` uses it with a default of `8000`. | `server.ts`; `backend/main.py` |
| `GEMINI_API_KEY` | Read by the Node server for Gemini integration. `.env.example` contains an empty placeholder. | `server.ts`; `.env.example` |
| `MODEL_PATH` | Optional model file path. Node defaults to `ml/model/scamshield_xgb.json`; Python model service also reads this variable. | `server.ts`; `backend/services/scamshield_model.py`; `backend/README.md` |
| `NODE_ENV` | Selects production static-file serving versus development Vite middleware in the Node server. | `server.ts` |
| `DISABLE_HMR` | Disables Vite HMR and file watching when equal to `true`. | `vite.config.ts` |

`.env.example` lists only `VITE_BASE_PATH`, `PORT`, and `GEMINI_API_KEY`; it does not list `NODE_ENV`, `DISABLE_HMR`, or `MODEL_PATH`. `.gitignore` ignores `.env*` except `.env.example`. No secrets or values for hosted environments are verified. Keep credentials out of committed files; the repository does not document a hosting secret store.

## Services, data, and configuration differences

- Browser application: React and TypeScript bundled by Vite. The GitHub Pages workflow publishes a static artifact; it does not start the Node or Python service.
- Node service: Express routes and, outside production mode, Vite middleware live in `server.ts`. The production branch serves the `dist` directory. The Node server has model loading code and reads a Gemini API key.
- Python service: FastAPI application in `backend/main.py`, runnable with Uvicorn as described in `backend/README.md`. It reads `PORT` in direct execution; the README's Uvicorn command uses port 8000. Its model path is configurable through `MODEL_PATH`.
- Machine learning assets are present under both `ml/` and `backend/ml/`. The repository does not establish which artifact is intended for each deployed service or whether those copies are kept in sync.
- `mongodb` is a Node dependency, but a production database connection/service is not established by the inspected deployment configuration. Database type, endpoint, migrations, and hosted data services are **UNKNOWN / NEEDS CONFIRMATION**.
- No staging-specific configuration, production variable set, secret-management setup, or service orchestration configuration was found in the inspected project files.
