# Milestone: Render Deploy Stability

## Overview
This milestone captures the work completed to unblock and harden the Render deployment pipeline for the CBDGold frontend. The focus was ensuring all native dependencies resolve reliably within Render’s Linux x64 environment so that `npm run build` succeeds without manual intervention.

## Key Changes
- Added explicit x64 GNU variants of Rollup, LightningCSS, and Tailwind CSS oxide as optional dependencies in `package.json`.
- Updated the Render blueprint so the frontend build script installs the LightningCSS and Tailwind CSS oxide binaries before invoking Vite.
- Standardized the build script to set `ROLLUP_SKIP_NODEJS_NATIVE=1`, preventing optional Rollup modules from crashing during bundling.

## Validation
- Repeated local builds (`SKIP_CLIENT_GEN=1 npm run build`) complete successfully with the updated dependency strategy.
- Git history (commit `84909fd`) records the configuration that produces a clean Render build.

## Next Steps
- Monitor upcoming Render deployments to confirm optional dependency installs continue to succeed.
- If native module versions change, update the explicit install commands and optional dependency entries together.
