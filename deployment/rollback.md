# Rollback and recovery

[← Deployment](deployment.md) · [Release checklist →](release-checklist.md)

> [!CAUTION]
> No tested rollback procedure is defined in the repository. Confirm host-specific recovery steps and access before a release.

## Current capability

| Deployment path | What exists | Rollback status |
|---|---|---|
| **GitHub Pages** | Workflow deploys with `actions/deploy-pages@v4`. | No rollback job, release tag, artifact retention/redeploy instructions, or automatic policy is defined. Redeploying a previous Git revision may be possible, but is not documented or verified. |
| **Surge** | Script publishes the current `dist` directory to a fixed hostname. | No prior deployment snapshot or rollback command is documented. **UNKNOWN / NEEDS CONFIRMATION.** |
| **Node / Python services** | Application entry points exist. | No deployment manifests, image tags, process supervisor setup, or prior-version recovery steps were found. |

## Before relying on recovery

The repository does not define a safe, tested rollback procedure. Confirm the host's method for selecting and redeploying a previous artifact or revision, verify that the previous build can be reproduced, and confirm account access. Do not treat the current `dist/` folder as a prior release: it is ignored build output and may be stale.

## Database and migrations

No migration tool, migration directory, schema deployment command, backup procedure, or restore procedure was found. `mongodb` is a package dependency, but that does not establish an active production database.

Database usage, schema changes, migration compatibility, and backup/restore behavior are **UNKNOWN / NEEDS CONFIRMATION**. Migration rollback is not established.

## Configuration and failure recovery

- Restore configuration only after identifying the host's current values and a known previous set; no configuration history or rollback mechanism is documented.
- For model-load failures, check `MODEL_PATH`, file availability, and the service health endpoint. This is diagnostic guidance, not automated recovery.
- For failed Pages or Surge deployments, host-side history, access, and a verified prior artifact must be checked manually.

**Automated rollback, health-gated release, backup recovery, and database rollback are not implemented or established** in the inspected project configuration.

