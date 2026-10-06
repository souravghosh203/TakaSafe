# Environments and configuration

[← Deployment guide](README.md) · [Build →](build.md)

> [!NOTE]
> This page describes what the repository defines. It does not confirm which environments are currently hosted or in use.

## Environment map

| Environment or path | What is defined | What still needs confirmation |
|---|---|---|
| **Local development** | `npm run dev` starts `server.ts` with Express and Vite middleware. Vite listens on `0.0.0.0:3000`. | Local machine-specific setup beyond the checked-in scripts. |
| **GitHub Pages** | `.github/workflows/deploy.yml` builds on pushes to `main` or `master` and manual dispatch. It sets `VITE_BASE_PATH=/TakaSafe/` and publishes `dist`. | Pages settings, successful workflow runs, active site, and its URL. |
| **Surge** | `npm run deploy` builds and calls `surge ./dist takasafe-diu.surge.sh`. | CLI installation, authentication, domain ownership, and whether this is a release path. |
| **Staging / production** | Node code has a `NODE_ENV=production` mode that serves `dist`. The root README mentions Cloud Run. | Actual hosting, staging environment, production topology, and relation to Pages or Surge. **UNKNOWN / NEEDS CONFIRMATION.** |

## Environment variables

| Variable | Purpose / default | Source |
|---|---|---|
| `VITE_BASE_PATH` | Vite asset base path; defaults to `/`. Pages workflow sets `/TakaSafe/`. | `vite.config.ts`, `.github/workflows/deploy.yml` |
| `PORT` | Node listener defaults to `3000`; Python direct execution defaults to `8000`. | `server.ts`, `backend/main.py` |
| `GEMINI_API_KEY` | Used by Node server for Gemini integration. `.env.example` has an empty placeholder. | `server.ts`, `.env.example` |
| `MODEL_PATH` | Optional model path. Node defaults to `ml/model/scamshield_xgb.json`; Python service also reads it. | `server.ts`, `backend/services/scamshield_model.py` |
| `NODE_ENV` | Chooses production static serving or development Vite middleware in Node. | `server.ts` |
| `DISABLE_HMR` | When `true`, disables Vite HMR and file watching. | `vite.config.ts` |

`.env.example` lists only `VITE_BASE_PATH`, `PORT`, and `GEMINI_API_KEY`. `.gitignore` ignores `.env*` except `.env.example`. Hosted values and secret storage are not documented in the repository.

> [!CAUTION]
> Treat API keys as secrets. Do not put real credentials in committed files. The repository does not identify a host-level secret manager.

## Services and configuration boundaries

| Component | Repository evidence | Deployment implication |
|---|---|---|
| **Web client** | React and TypeScript bundled by Vite. | GitHub Pages publishes static files; it does not run the API services. |
| **Node service** | Express routes in `server.ts`, with model loading and Gemini key access. Production mode serves `dist`. | Requires a Node runtime if server routes are needed. |
| **Python service** | FastAPI app in `backend/main.py`; Uvicorn run instructions in `backend/README.md`. | No hosting or service configuration is present. |
| **Model files** | Assets exist under both `ml/` and `backend/ml/`. | Intended artifact per service and synchronization between copies are **UNKNOWN / NEEDS CONFIRMATION**. |
| **Database** | `mongodb` is a declared Node dependency. | A production database connection, endpoint, schema, and migrations are not established. **UNKNOWN / NEEDS CONFIRMATION.** |

No staging-specific configuration, production variable set, secret-management setup, or service orchestration configuration was found.

