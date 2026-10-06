# Release checklist

Use this checklist for a release. Items that require host or operational evidence cannot be considered complete from repository contents alone.

## Code and build

- [ ] Review the changes and confirm the intended commit/revision.
- [ ] Install dependencies using the same method as the target workflow (`npm install --legacy-peer-deps` for GitHub Pages).
- [ ] Run `npm run build`; confirm `dist/index.html` and `dist/200.html` exist.
- [ ] Run `npm run lint` and review its TypeScript check output.
- [ ] Identify and run applicable tests. No test script is declared in `package.json`; test coverage and required test commands need confirmation.
- [ ] Confirm `VITE_BASE_PATH` matches the target URL mount path (Pages workflow currently sets `/TakaSafe/`).

## Environment, secrets, and services

- [ ] Confirm target environment (development, staging, or production), hosting provider, and deployment owner.
- [ ] Verify all target variables and their values through the host's configuration; `.env.example` is incomplete for all code paths.
- [ ] Provide secrets through the host's secret mechanism. Confirm `GEMINI_API_KEY` if Gemini-backed server behavior is required; never commit real credentials.
- [ ] Confirm `PORT`, `NODE_ENV`, `DISABLE_HMR`, and `MODEL_PATH` where relevant to the selected runtime.
- [ ] Confirm the model artifact exists at the configured path and the running service loads it.
- [ ] Confirm required API services, network routes, CORS/origin behavior, and any database/service dependencies. Production database and backend hosting are not established by this repository.

## Compatibility and data changes

- [ ] Review API request/response compatibility between the deployed frontend and backend.
- [ ] Confirm any database/schema changes, migration plan, backup, and restore path. No migration/backup process is documented in the repository.
- [ ] Confirm model and feature schema compatibility with the service version.

## Deployment and post-deployment verification

- [ ] Confirm the actual release path. For GitHub Pages, check Pages settings, workflow permissions, selected branch, environment rules, and target URL.
- [ ] For Surge, verify CLI, authentication, and target hostname before running `npm run deploy`.
- [ ] Deploy the intended build and retain or identify the prior artifact/revision for recovery.
- [ ] Check static page loading, asset URLs, and browser console at the deployed base path.
- [ ] Check the applicable API health endpoint and verify model-loaded status; static hosting does not run the API server.
- [ ] Smoke-test critical user flows and frontend/backend interactions against the target environment.
- [ ] Review runtime logs and monitoring/alerts. Monitoring configuration is not found in the repository and needs manual confirmation.
- [ ] Record deployment revision, time, operator, environment, and result using the team's established process (not specified in this repository).
- [ ] Confirm a practical recovery path and responsible operator before release. Automated rollback and database restore are not established here.
