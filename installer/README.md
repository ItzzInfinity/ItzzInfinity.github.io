# Installers

One setup script per OS. Each installs Node 20, the npm dependencies, and — if Python 3 is present — the PyMuPDF tooling used by the resume layout self-check. All scripts are idempotent: re-running them is safe.

| OS | Script | How to run |
|---|---|---|
| Linux | `install-linux.sh` | `./installer/install-linux.sh` |
| macOS | `install-macos.sh` | `./installer/install-macos.sh` |
| Windows | `install-windows.ps1` | `powershell -ExecutionPolicy Bypass -File installer\install-windows.ps1` |

What they do:

1. **Node 20** — Linux/macOS use [nvm](https://github.com/nvm-sh/nvm) (installed if missing; macOS prefers Homebrew's nvm when brew is available). Windows uses `winget install OpenJS.NodeJS.LTS`.
2. **`npm install`** in the repo root.
3. **`pip install -r scripts/requirements.txt`** (PyMuPDF) — optional; skipped with a note if Python 3 or pip isn't available. Only the QA scripts (`scripts/self-check.tsx`, `scripts/extract_*.py`) need it; the web app does not.

After installing, start the dev server:

```bash
./dev.sh        # Linux/macOS (loads nvm, then npm run dev)
npm run dev     # Windows, or any shell where Node 20 is already on PATH
```

Then follow **"Use it with your data and host it on your GitHub"** in the top-level [README](../README.md).
