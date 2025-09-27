#!/usr/bin/env bash
# Load backend .env (if present) and start server with security headers
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; source .env; set +a
fi
NODE_ENV=${NODE_ENV:-development} ENABLE_SECURITY_HEADERS=${ENABLE_SECURITY_HEADERS:-true} node server.js
