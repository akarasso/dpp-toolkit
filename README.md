# dpp-toolkit

Claude Code plugin for EU **Digital Product Passport** research. It composes two existing MCP servers — without merging them — and adds the expertise layer on top:

```
dpp-toolkit/
├── .claude-plugin/
│   ├── plugin.json          # plugin manifest
│   └── marketplace.json     # lets this repo act as its own (local) marketplace
├── .mcp.json                # declares the two MCP servers: cirpass + cordis
├── skills/dpp-research/     # the research workflow (search strategy, PDF paging, CORDIS cross-ref)
├── agents/dpp-expert.md     # subagent for delegated multi-step DPP research
├── commands/
│   ├── brief.md             # /dpp-toolkit:brief <sujet> — sourced research brief (via dpp-expert)
│   ├── veille.md            # /dpp-toolkit:veille [période] — news/events/deliverables/open-calls digest
│   └── reset.md             # /dpp-toolkit:reset — wipe this machine's caches
└── scripts/validate.mjs     # pnpm validate — structure + frontmatter + .mcp.json path checks
```

| Layer | Repo | Role |
|---|---|---|
| Data (snapshot) | [`cirpass-claude-mcp`](https://github.com/EmblemTech/cirpass-claude-mcp) | CIRPASS-1/2 sites, deliverable PDF text, Open DPP Catalogue |
| Data (live) | [`cordis-claude-mcp`](https://github.com/EmblemTech/cordis-claude-mcp) | CORDIS, SEDIA funding portal, DET bulk extraction |
| Expertise | this repo | skill + agent that know how to drive both |

## Prerequisites

- **GitHub access** (SSH) to the two private repos above — the plugin launches both servers straight from git.
- **Node 22+** (oldest supported LTS; runs the cirpass server via `npx`) and **[uv](https://docs.astral.sh/uv/)** (runs the cordis server).

`.mcp.json` resolves the servers from git at session start: when a new version lands
on `main` (e.g. a merged data-refresh PR), everyone picks it up automatically at
their next session — no manual update. First launch after a change rebuilds
(~1 min) and needs network; unchanged versions start from cache.

**Hacking on a server locally?** Point the entry at your checkout instead, e.g.
`"command": "node", "args": ["/path/to/cirpass-claude-mcp/dist/index.js"]`.

## Install

### 1. Check the prerequisites

```bash
ssh -T git@github.com     # must greet you — SSH access to the EmblemTech repos
node --version            # >= 22 (oldest supported LTS)
uv --version              # https://docs.astral.sh/uv/ if missing
```

### 2. Remove any old standalone MCP registrations ⚠️

If you ever registered these servers directly (`claude mcp add cirpass …` / `claude mcp add cordis …`, or a tarball install), remove them first — otherwise they run **alongside** the plugin's copies (duplicate tools, and yours would go stale while the plugin auto-updates):

```bash
claude mcp list                 # look for cirpass / cordis outside the plugin
claude mcp remove cirpass       # repeat with -s user / -s project if listed in several scopes
claude mcp remove cordis
npm uninstall -g cirpass-claude-mcp   # only if you had installed the tarball globally
```

### 3. Install the plugin

This repo is **private** — `marketplace add` clones it over git, so use the SSH URL (guaranteed to work with the SSH access from step 1):

```bash
claude plugin marketplace add git@github.com:EmblemTech/dpp-toolkit.git
claude plugin install dpp-toolkit@dpp-toolkit
```

(The `EmblemTech/dpp-toolkit` shorthand also works, but only on machines with GitHub HTTPS credentials configured — e.g. `gh auth login`. A local clone works too: `claude plugin marketplace add /path/to/dpp-toolkit`.)

### 4. First session

Start a new Claude Code session. The first launch resolves and builds both servers from git (~1 min, network required) — later sessions start from cache. The embedding model (~30 MB) downloads once, at your first semantic search.

Verify: `/mcp` should show `cirpass` and `cordis` connected (via the plugin), and `/dpp-toolkit:veille` should answer.

### Troubleshooting

- `ssh -T git@github.com` fails → fix your GitHub SSH key first; the servers install from private repos.
- A server won't start or behaves oddly → `/dpp-toolkit:reset` wipes this machine's caches, then restart the session.

## Use

- Ask any DPP question — the `dpp-research` skill loads when relevant and guides tool usage (AND/OR `match_mode`, `next_offset` paging, Zenodo via `fetch_live`, CORDIS cross-referencing).
- Delegate big questions to the agent: *"Use the dpp-expert agent: état de l'art des démonstrateurs DPP textile, avec sources."*
- Pre-wired commands: `/dpp-toolkit:brief <sujet>` (sourced research brief), `/dpp-toolkit:veille [période]` (intelligence digest), `/dpp-toolkit:reset` (wipe this machine's caches for a clean re-install).

## Per-machine caches (nothing is "built" locally)

Data and the semantic index ship **inside** the cirpass package — users never crawl or embed anything. Three caches exist per machine, all populated automatically:

| Cache | Where | Refreshes |
|---|---|---|
| cirpass server (built package) | `~/.npm/_npx` | automatically when a new commit lands on `main` |
| cordis server (Python env) | uv cache | same, resolved from git |
| embedding model (~30 MB) | `~/.cache/cirpass-mcp/models` | downloaded once per machine, never re-downloaded |

`/dpp-toolkit:reset` wipes all three when something is corrupted; the next session rebuilds from scratch.

## Development

Managed with [pnpm](https://pnpm.io) (`packageManager` pinned in package.json):

```bash
pnpm install    # no runtime deps — sets up the lockfile
pnpm validate   # checks plugin structure, frontmatter, and .mcp.json paths
```

## Roadmap

- Optional semantic search (RAG) layer over the CIRPASS corpus — see discussion in cirpass-claude-mcp.
- Product layer: a Claude Agent SDK app reusing the same two servers and this skill as system prompt.
