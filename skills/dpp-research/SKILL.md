---
name: dpp-research
description: Research workflow for EU Digital Product Passport (DPP) topics using the cirpass and cordis MCP servers — search strategy, reading deliverable PDFs, live fallbacks, CORDIS cross-referencing. Use when answering questions about CIRPASS-1/2, the DPP ecosystem, ESPR regulation, DPP standards, pilots, or related EU-funded projects.
---

# DPP Research Workflow

## Data landscape

Two MCP servers, complementary — always pick the right one first:

| Server | Nature | Use for |
|---|---|---|
| `cirpass` | **Bundled snapshot** of cirpassproject.eu + cirpass2.eu (full text incl. extracted PDF text, offline) | Anything CIRPASS-specific: deliverables, news, events, Open DPP Catalogue, CoP/EWG partners |
| `cordis` | **Live** EU APIs (CORDIS search, SEDIA funding portal, DET bulk extraction) | Project metadata, related EU projects, publications, open funding calls, consortium data |

Also relevant if available: the `droit-europeen` MCP for EUR-Lex (ESPR = Regulation (EU) 2024/1781, CELEX 32024R1781; the battery DPP is in Regulation (EU) 2023/1542).

Start a CIRPASS session with `get_data_status` if freshness matters — the snapshot has a crawl date.

## Searching CIRPASS content

- Use `search` with **precise English keywords** (the corpus is English; French queries only work via the OR fallback and match poorly).
- Check `match_mode` in the response: `"all"` = every term matched (strong results); `"any"` = the AND query failed and this is a partial OR match — treat results as weak, rephrase or drop rare terms.
- Results carry a contextual `snippet` around the matched terms — often enough to judge relevance without fetching the document.
- Narrow with `site` (`cirpass1` = 2022–2024 pilot, `cirpass2` = 2024–2027 deployment), `type` (e.g. `dlm_download`, `post`, `page`, `opendpp-catalogue`, `media-pdf`), or `taxonomy_slug`. Discover available filters with `list_taxonomies` / `list_taxonomy_terms`.
- For deliverables specifically, prefer `list_deliverables` (it merges CIRPASS-1 `dlm_download` posts with CIRPASS-2's curated results pages + media PDFs).

## Reading long documents (deliverable PDFs)

- `get_document` pages its content: 25k chars per call by default. When `content_truncated` is true, call again with `offset` = `next_offset`. `content_length` tells you the total upfront.
- Bundled PDF text is capped at 100k chars. If `custom_fields.pdf_text_truncated` is set, the PDF is even longer — fetch the source PDF with `fetch_live` for the full text.
- `fetch_live` pages the same way (`offset` / `next_offset`) and caches the fetched document ~10 minutes, so paging does NOT re-download. Allowed hosts: cirpassproject.eu, cirpass2.eu, cordis.europa.eu, ec.europa.eu, data.europa.eu, doi.org, zenodo.org. Recent CIRPASS-2 deliverables live on Zenodo behind DOIs — `fetch_live` follows the redirect and extracts the PDF text.

## Cross-referencing with CORDIS

- Grant agreements: CIRPASS-1 = **101083432**, CIRPASS-2 = **101158775**. `get_project` returns full metadata; `list_project_organizations` returns the actual consortium (more structured than the CIRPASS sites' partner pages, which are name+logo only).
- `search_projects` finds related EU projects (e.g. other DPP/traceability projects); `search_results` finds their outputs; `search_topics_calls` lists **open** funding topics (live SEDIA data).
- CORDIS search covers Horizon Europe + H2020 only; for older programmes use the DET bulk extraction tools. DET allows **one extraction at a time** and takes 15–60 s even for small sets.

## Synthesis rules

- Cite sources: document `id` + `url` for CIRPASS content, grant/RCN ids for CORDIS.
- Date caveat: on CIRPASS events, `date` is the WordPress **publish** date, not the event date — the real date is in the text.
- Keep CIRPASS-1 (completed pilot: methodology, roadmap, use cases for batteries/electronics/textiles) distinct from CIRPASS-2 (ongoing: demonstrators, CoP, EWGs, Open DPP Catalogue).
- When the question touches regulation, anchor claims in EUR-Lex (via `droit-europeen` if available, else `fetch_live` on ec.europa.eu) rather than project material alone.
