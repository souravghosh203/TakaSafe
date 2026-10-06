# Release checklist

[← Rollback](rollback.md) · [Deployment →](deployment.md)

Work through the relevant items for each release. A checked-in script or workflow does not replace checking the target host and live service.

## 1. Code and build

- [ ] Review the changes and confirm the intended commit or revision.
- [ ] Install dependencies using the target workflow's method (`npm install --legacy-peer-deps` for GitHub Pages).
- [ ] Run `npm run build`; confirm `dist/index.html` and `dist/200.html` exist.
- [ ] Run `npm run lint` and review the TypeScript check output.
- [ ] Identify and run applicable tests. `package.json` declares no test script; test coverage and required commands need confirmation.
- [ ] Confirm `VITE_BASE_PATH` matches the target URL mount (`/TakaSafe/` in the Pages workflow).

## 2. Environment, secrets, and services

- [ ] Confirm the target environment, hosting provider, and deployment owner.
- [ ] Verify target variables in the host configuration; `.env.example` is not a complete specification for all code paths.
- [ ] Supply secrets through the host's secret mechanism. Confirm `GEMINI_API_KEY` if Gemini-backed server behavior is required; never commit real credentials.
- [ ] Confirm `PORT`, `NODE_ENV`, `DISABLE_HMR`, and `MODEL_PATH` as relevant to the selected runtime.
- [ ] Confirm the model artifact exists at the configured path and the running service loads it.
- [ ] Confirm API services, network routes, CORS/origins, and database dependencies. Production database and backend hosting are not established in this repository.

## 3. Compatibility and data changes

- [ ] Review API request and response compatibility between the deployed frontend and backend.
- [ ] Confirm any database/schema changes, migration plan, backup, and restore path. No migration or backup process is documented in the repository.
- [ ] Confirm model and feature schema compatibility with the service version.

## 4. Deploy and verify

- [ ] Confirm the actual release path. For Pages, check settings, workflow permissions, selected branch, environment rules, and target URL.
- [ ] For Surge, verify CLI, account authentication, and hostname before running `npm run deploy`.
- [ ] Deploy the intended build and identify the prior artifact or revision for recovery.
- [ ] Check page loading, asset URLs, and browser console at the deployed base path.
- [ ] Check the applicable API health endpoint and model-loaded status; static hosting does not run the API service.
- [ ] Smoke-test critical user flows and frontend/backend interactions against the target environment.
- [ ] Review runtime logs and monitoring/alerts. Monitoring configuration is not in the repository and needs manual confirmation.
- [ ] Record deployment revision, time, operator, environment, and result using the team's process (not specified in this repository).
- [ ] Confirm a practical recovery path and responsible operator. Automated rollback and database restore are not established here.
