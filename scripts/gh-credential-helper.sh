#!/usr/bin/env bash
set -euo pipefail
export GH_CONFIG_DIR="/srv/clawdbot/state/.config/gh"
exec gh auth git-credential "$@"
