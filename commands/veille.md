---
description: DPP intelligence digest — what's new since a date (CIRPASS news/events/deliverables + open EU calls)
argument-hint: [période, ex. "30 derniers jours" ou "2026-06-01"]
---

Build a DPP intelligence digest ("veille") for the period: **$ARGUMENTS** (default when empty: the last 30 days).

Steps:
1. `get_data_status` (cirpass MCP) — note the snapshot date. If the period extends beyond it, complement with `fetch_live` on the news/events pages of cirpass2.eu.
2. `list_news` and `list_events` with `since` set to the period start (both sites). For events, use `event_date` when present.
3. `list_deliverables` — flag entries whose date falls in the period.
4. `search_topics_calls` (cordis MCP) — currently open funding topics relevant to DPP/circular economy keywords.
5. Optional when something major appears: `search_articles` (CORDIS news) for the same period.

Output, in French:
- **À retenir** — 3 bullets max.
- **Nouveautés CIRPASS** — news/événements/deliverables de la période, datés, avec liens.
- **Appels ouverts** — opportunités de financement pertinentes avec deadlines.
- **Rien à signaler** explicitly for sections with no news (don't pad).
