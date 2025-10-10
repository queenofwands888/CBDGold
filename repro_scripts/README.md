# Reproducible Audit Scripts

This directory contains scripts to reproduce the security audit and user-flow smoke test for the Algorand Shopping + DeFi protocol.

## Prerequisites
- Node.js (for smoke_test.js)
- Python 3 and `algosdk` (for contract_audit.py)
- Set environment variables as needed (see below)

## Scripts

### 1. smoke_test.js
Runs basic user-flow and API endpoint checks against the deployed frontend/backend.

**Usage:**
```sh
npm install axios
node smoke_test.js
```
- Set `TEST_BASE_URL` env variable to point to your deployed frontend/backend (default: http://localhost:5173)

### 2. contract_audit.py
Checks deployed Algorand contracts for existence and basic configuration.

**Usage:**
```sh
pip install py-algorand-sdk
ALGOD_ADDRESS=<algod_url> ALGOD_TOKEN=<token> APP_IDS=<comma_separated_appids> python3 contract_audit.py
```
- Set `ALGOD_ADDRESS`, `ALGOD_TOKEN`, and `APP_IDS` as needed (see your deploy/ directory or .env)

## Artifacts
- `../artifacts/tx_history.json`: Transaction history and audit artifacts will be written here.
- `../test_results.log`: Test and audit results log.

## Notes
- Update and extend these scripts as needed for deeper audits or more comprehensive user-flow tests.
