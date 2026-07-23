#!/usr/bin/env node
// Sanity-checks the plugin before commit/install:
//  - JSON files parse (plugin.json, marketplace.json, .mcp.json)
//  - MCP server binaries/paths referenced by .mcp.json exist on this machine
//  - skills/agents/commands markdown files have the required frontmatter
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

function readJson(rel) {
  const p = join(ROOT, rel);
  try {
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch (e) {
    errors.push(`${rel}: ${e.message}`);
    return null;
  }
}

function frontmatter(rel) {
  const raw = readFileSync(join(ROOT, rel), "utf-8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    errors.push(`${rel}: missing frontmatter block`);
    return {};
  }
  const fields = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

// --- JSON files ---
const plugin = readJson(".claude-plugin/plugin.json");
if (plugin && (!plugin.name || !plugin.description)) {
  errors.push("plugin.json: 'name' and 'description' are required");
}
const marketplace = readJson(".claude-plugin/marketplace.json");
if (marketplace && !Array.isArray(marketplace.plugins)) {
  errors.push("marketplace.json: 'plugins' array is required");
}
const mcp = readJson(".mcp.json");
if (mcp?.mcpServers) {
  for (const [name, cfg] of Object.entries(mcp.mcpServers)) {
    const args = cfg.args ?? [];
    // Check absolute paths referenced in args (server entrypoints, --directory targets)
    for (const a of args) {
      if (typeof a === "string" && a.startsWith("/") && !existsSync(a)) {
        errors.push(`.mcp.json: server '${name}' references missing path: ${a}`);
      }
    }
  }
} else if (mcp) {
  errors.push(".mcp.json: 'mcpServers' object is required");
}

// --- markdown components ---
function checkDir(dir, required, { nested = false } = {}) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) {
    warnings.push(`${dir}/ absent`);
    return;
  }
  const files = [];
  for (const entry of readdirSync(abs)) {
    const p = join(abs, entry);
    if (nested && statSync(p).isDirectory()) {
      const skill = join(p, "SKILL.md");
      if (existsSync(skill)) files.push(join(dir, entry, "SKILL.md"));
      else warnings.push(`${dir}/${entry}/: no SKILL.md`);
    } else if (entry.endsWith(".md")) {
      files.push(join(dir, entry));
    }
  }
  for (const f of files) {
    const fm = frontmatter(f);
    for (const key of required) {
      if (!fm[key]) errors.push(`${f}: frontmatter '${key}' is required`);
    }
  }
  return files.length;
}

checkDir("skills", ["name", "description"], { nested: true });
checkDir("agents", ["name", "description"]);
checkDir("commands", ["description"]);

// --- report ---
for (const w of warnings) console.log(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log("✓ plugin structure valid");
