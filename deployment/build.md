# Build and artifacts

[← Environments](environments.md) · [Deployment →](deployment.md)

## Prerequisites

| Use | Requirement established by the repository |
|---|---|
| Frontend / Node build | Node.js 22 is selected by the GitHub Actions workflow. npm dependencies are recorded in `package-lock.json`. No local Node version file is present. |
| Python API | Python and `backend/requirements.txt`; no Python version is pinned. |
| Optional ML notebook | Python and `notebook/requirements.txt`; no Python version is pinned. |

## Install dependencies

**Frontend and Node service**

```sh
npm install
```

The GitHub Pages workflow uses `npm install --legacy-peer-deps`.

**Optional Python services**

```sh
pip install -r backend/requirements.txt
```

**Optional notebook environment**

```sh
pip install -r notebook/requirements.txt
```

## Build the frontend

```sh
npm run build
```

This runs `vite build`, then copies `dist/index.html` to `dist/200.html`. The generated output directory is `dist/`; `200.html` may support static-host fallback behavior where the host supports it.

### Other declared npm scripts

| Command | What the package script does | Note |
|---|---|---|
| `npm run dev` | Runs `tsx server.ts`. | Express with Vite middleware in development mode. |
| `npm start` | Runs `node server.ts`. | TypeScript execution by plain Node is runtime-dependent and was not validated in this audit. |
| `npm run preview` | Runs `vite preview`. | Local preview command. |
| `npm run lint` | Runs `tsc --noEmit`. | TypeScript check; no separate lint tool is configured. |
| `npm run deploy` | Builds, then runs `surge ./dist takasafe-diu.surge.sh`. | Requires Surge CLI and authentication; neither is verified. |

## Build configuration

- GitHub Pages sets `VITE_BASE_PATH=/TakaSafe/`. Other targets need a base path matching their URL mount point.
- `.env.example` contains placeholders and is not a complete specification of required build or runtime variables.
- `GEMINI_API_KEY` is read by server-side Node code. A static frontend build does not provide a server-side secret.

## Artifacts and limits

- The Pages workflow uploads the complete `dist` directory.
- `dist/` is ignored by Git. A local copy may be stale and is not evidence of a release artifact.
- Model JSON files are checked in under `ml/model/` and `backend/ml/model/`. Model export/versioning is not part of the deployment workflow.
- No build cache, artifact retention policy, signed artifact, container image, or versioned release artifact process is configured in the inspected files.
- **Build success was not verified as part of this documentation audit.**

