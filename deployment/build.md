# Build and artifacts

## Prerequisites

- Node.js 22 is selected by `.github/workflows/deploy.yml` for its GitHub Actions build. The repository does not specify a local Node version file.
- npm and the dependencies in `package-lock.json` are used by the documented scripts/workflow.
- Python is needed only for the separate FastAPI backend or the optional notebook workflow. `backend/requirements.txt` and `notebook/requirements.txt` list their respective Python dependencies; no Python version is pinned.

## Install dependencies

Frontend / Node project:

```sh
npm install
```

The GitHub Pages workflow specifically runs `npm install --legacy-peer-deps`.

Optional Python backend:

```sh
pip install -r backend/requirements.txt
```

Optional notebook dependencies:

```sh
pip install -r notebook/requirements.txt
```

## Build commands

```sh
npm run build
```

The package script runs `vite build`, then copies `dist/index.html` to `dist/200.html`. The latter is therefore part of the generated output and is used for static-host fallback behavior where supported. Build output is `dist/`.

Other declared scripts:

| Command | Declared behavior |
|---|---|
| `npm run dev` | Runs `tsx server.ts` (Express plus Vite middleware in development). |
| `npm start` | Runs `node server.ts`; whether plain Node can execute this TypeScript file depends on the Node runtime and is not validated by this audit. |
| `npm run preview` | Runs `vite preview`. |
| `npm run lint` | Runs `tsc --noEmit`. Despite its name, this is a TypeScript check, not a configured lint tool. |
| `npm run deploy` | Runs the build, then `surge ./dist takasafe-diu.surge.sh`. Requires a working Surge CLI and authentication, neither verified here. |

GitHub Pages sets `VITE_BASE_PATH=/TakaSafe/` for its build. For other hosting targets, the correct base path depends on the URL mount point; no other target-specific build configuration is verified. The `.env.example` has placeholders, not a required or complete build-time environment specification. `GEMINI_API_KEY` is read by server-side Node code; do not assume a static frontend artifact supplies a server-side secret.

## Generated artifacts and missing verification

- `npm run build` is the verified declared production build command; the workflow uploads the complete `dist` directory.
- `dist/` is ignored by Git. Its presence in a working checkout does not establish that it is current or a release artifact.
- The model JSON files are checked into the repository under `ml/model/` and `backend/ml/model/`; generated/trained model export procedure and release versioning are not part of the deployment workflow.
- No build cache, artifact retention policy, signed artifact, container image, or versioned release artifact process is configured in the inspected files.
- Build success has not been asserted by this documentation audit.
