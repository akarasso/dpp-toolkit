# dpp-toolkit

Claude Code plugin for EU **Digital Product Passport** research. It composes two existing MCP servers — without merging them — and adds the expertise layer on top:

```
dpp-toolkit/
├── .claude-plugin/
│   ├── plugin.json          # plugin manifest
│   └── marketplace.json     # lets this repo act as its own (local) marketplace
├── .mcp.json                # declares the two MCP servers: cirpass + cordis
├── skills/dpp-research/     # the research workflow (search strategy, PDF paging, CORDIS cross-ref)
└── agents/dpp-expert.md     # subagent for delegated multi-step DPP research
```

| Layer | Repo | Role |
|---|---|---|
| Data (snapshot) | [`cirpass-claude-mcp`](https://github.com/EmblemTech/cirpass-claude-mcp) | CIRPASS-1/2 sites, deliverable PDF text, Open DPP Catalogue |
| Data (live) | [`cordis-claude-mcp`](https://github.com/EmblemTech/cordis-claude-mcp) | CORDIS, SEDIA funding portal, DET bulk extraction |
| Expertise | this repo | skill + agent that know how to drive both |

## Prerequisites

- `cirpass-claude-mcp` cloned as a sibling and built (`npm install && npm run build`)
- `cordis-claude-mcp` cloned as a sibling and synced (`uv sync`)
- `.mcp.json` uses absolute paths — adjust them if your checkouts live elsewhere.

## Install

```bash
claude plugin marketplace add /home/alexandre/workspaces/trace/dpp-toolkit
claude plugin install dpp-toolkit@dpp-toolkit
```

If you previously registered `cirpass` / `cordis` directly with `claude mcp add`, remove those registrations (`claude mcp remove cirpass` etc.) so the plugin's copies are the only ones running.

## Use

- Ask any DPP question — the `dpp-research` skill loads when relevant and guides tool usage (AND/OR `match_mode`, `next_offset` paging, Zenodo via `fetch_live`, CORDIS cross-referencing).
- Delegate big questions to the agent: *"Use the dpp-expert agent: état de l'art des démonstrateurs DPP textile, avec sources."*

## Roadmap

- Optional semantic search (RAG) layer over the CIRPASS corpus — see discussion in cirpass-claude-mcp.
- Product layer: a Claude Agent SDK app reusing the same two servers and this skill as system prompt.
