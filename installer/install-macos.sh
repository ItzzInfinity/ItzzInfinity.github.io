#!/usr/bin/env bash
# Resume Builder installer — macOS
# Installs nvm + Node 20, the npm dependencies, and (optionally) the
# Python PDF-QA tooling. Safe to re-run; every step is idempotent.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION=20

info()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m ✓ \033[0m %s\n' "$*"; }
fail()  { printf '\033[1;31m ✗ \033[0m %s\n' "$*" >&2; exit 1; }

# Xcode Command Line Tools provide git, curl, python3.
if ! xcode-select -p >/dev/null 2>&1; then
  info "Installing Xcode Command Line Tools (a dialog will pop up) ..."
  xcode-select --install || true
  fail "Finish the Command Line Tools installation, then re-run this script."
fi

# --- nvm + Node 20 ---------------------------------------------------------
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  if command -v brew >/dev/null 2>&1; then
    info "Installing nvm via Homebrew ..."
    brew install nvm
    mkdir -p "$NVM_DIR"
    NVM_SH="$(brew --prefix nvm)/nvm.sh"
  else
    info "Installing nvm (Node Version Manager) to $NVM_DIR ..."
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    NVM_SH="$NVM_DIR/nvm.sh"
  fi
else
  ok "nvm already installed"
  NVM_SH="$NVM_DIR/nvm.sh"
fi

# shellcheck disable=SC1090
. "$NVM_SH"

info "Installing Node $NODE_VERSION ..."
nvm install "$NODE_VERSION" >/dev/null
nvm use "$NODE_VERSION" >/dev/null
ok "Using Node $(node --version), npm $(npm --version)"

# --- npm dependencies ------------------------------------------------------
info "Installing npm dependencies in $REPO_DIR ..."
cd "$REPO_DIR"
npm install
ok "npm dependencies installed"

# --- optional: Python tooling (PyMuPDF) for resume layout QA ----------------
if command -v python3 >/dev/null 2>&1; then
  info "Installing Python PDF-QA tooling (PyMuPDF) ..."
  if python3 -m pip install --user -r scripts/requirements.txt >/dev/null 2>&1 \
     || python3 -m pip install --user --break-system-packages -r scripts/requirements.txt >/dev/null 2>&1; then
    ok "PyMuPDF installed (enables scripts/self-check.tsx layout verification)"
  else
    echo "    (skipped: pip install failed — the app still works; only the"
    echo "     geometric layout self-check scripts need PyMuPDF)"
  fi
else
  echo "    (python3 not found — skipping PDF-QA tooling; the app itself doesn't need it)"
fi

# ---------------------------------------------------------------------------
cat <<EOF

All set! Next steps:

  cd $REPO_DIR
  ./dev.sh                # start the dev server (loads nvm for you)
                          # or: nvm use $NODE_VERSION && npm run dev

  Then open  http://localhost:3000
  Edit data  http://localhost:3000/settings
  Resume     http://localhost:3000/download

To publish to GitHub Pages, see "Use it with your data" in README.md.
EOF
