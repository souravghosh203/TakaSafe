# Rollback and recovery

## Current rollback capability

- GitHub Pages is deployed through `actions/deploy-pages@v4`. The workflow contains no rollback job, release tag, artifact retention/redeploy instructions, or automatic rollback policy. A recovery by redeploying a previous Git revision may be possible using repository history and the workflow, but it is **not documented or verified as an operational procedure**.
- The Surge script publishes the current `dist` directory to a fixed hostname. No previous deployment snapshot, rollback command, or Surge release process is documented in the repository. Recovery capability is **UNKNOWN / NEEDS CONFIRMATION**.
- The Node and Python services have no deployment manifests, image tags, process supervisor configuration, or previous-version recovery steps in the inspected files.

## Recovery guidance supported by available project information

The repository does not define a safe, tested rollback procedure. Before release, an operator must verify the host's mechanism for selecting and redeploying a prior artifact or source revision, ensure the prior build can be reproduced, and confirm access to the relevant hosting account. Do not assume the current `dist` directory is a prior release; it is ignored build output and may be stale.

## Database and migrations

No database migration tool, migration directory, schema deployment command, backup procedure, or restore procedure was found in the inspected project files. `mongodb` appears in `package.json`, but that alone does not establish an active production database. Database use, schema changes, backup/restore behavior, and migration compatibility are **UNKNOWN / NEEDS CONFIRMATION**. No migration rollback capability is established.

## Configuration and deployment failure recovery

- Restore a prior configuration only after identifying the actual host-level configuration and its previous values; no environment history or configuration rollback mechanism is documented.
- For model-load failures, verify `MODEL_PATH`, file availability, and the model health endpoint. This is diagnostic guidance from the code, not an automated recovery mechanism.
- For a failed Pages or Surge deployment, repository-defined automated recovery is absent. Host-side deployment history, access, and a verified prior artifact must be checked manually.
- Automated rollback, health-gated release, backup recovery, and database rollback are **NOT IMPLEMENTED / NOT ESTABLISHED** in the inspected project configuration.
