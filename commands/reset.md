---
description: Wipe this machine's dpp-toolkit caches (MCP servers + embedding model) to force a clean re-install at next session
---

The user wants to reset the dpp-toolkit caches on this machine. Proceed as follows:

1. Tell them what will be wiped, then run the three commands:
   - `rm -rf ~/.npm/_npx` — npx's cached server builds. Caveat to mention: this clears ALL npx-cached packages on the machine, not only cirpass (harmless — they re-install on demand).
   - `uv cache clean` — uv's cached environments (cordis server).
   - `rm -rf ~/.cache/cirpass-mcp/models` — the bundled embedding model (~30 MB, re-downloaded on the next semantic search).
2. Confirm what was freed (sizes if easy) and tell the user to start a new session (or reconnect MCP servers with /mcp): both servers will be re-resolved from git and rebuilt fresh.

Do NOT touch `~/.claude`, project data, or anything outside the three paths above.
