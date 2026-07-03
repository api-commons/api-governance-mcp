// Spectral lint engine wrapper — the same engine and best-of-breed ruleset the
// API Commons API Validator runs in the browser, here server-side over Node. It
// loads the compiled data-form ruleset (rules/all-rules.yaml, grouped by artifact
// format), resolves `spectral:*` extends to the built-in ruleset objects, wires
// custom functions, and lints a document. Nothing here is Spotlight-specific.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse as parseYaml } from 'yaml';
// spectral-core / -parsers / -formats are CommonJS; Node's ESM interop only surfaces
// a subset of names, so take the classes off the default (namespace) export.
import spectralCore from '@stoplight/spectral-core';
import Parsers from '@stoplight/spectral-parsers';
import fmts from '@stoplight/spectral-formats';
import { oas, asyncapi } from '@stoplight/spectral-rulesets';
import { FN_MAP } from './functions.mjs';

const { Spectral, Document, Ruleset } = spectralCore;

const __dirname = dirname(fileURLToPath(import.meta.url));

// The best-of-breed catalog: { <format>: { <ruleName>: <rule> } }. 733 rules
// across 12 artifacts, compiled from public Spectral rulesets + the API Evangelist
// governance rules. Every rule ships at `severity: info` to educate; adopters raise
// individual rules to warn/error for what they choose to enforce.
const ALL_RULES = parseYaml(readFileSync(join(__dirname, '..', 'rules', 'all-rules.yaml'), 'utf8'));

// Spectral ships built-in rulesets for OpenAPI + AsyncAPI only. Every other artifact
// (Arazzo, APIs.json, JSON Schema, MCP, agent-skill, plans, …) is linted entirely by
// its curated inline rules — no `extends`.
const BUILTIN_RULESETS = { 'spectral:oas': oas, 'spectral:asyncapi': asyncapi };
const EXTENDS_FOR = { openapi: 'spectral:oas', asyncapi: 'spectral:asyncapi' };

// Rule names contributed by each built-in (extended) ruleset, and which of them the
// engine runs by default (recommended !== false). Built-in rules reference functions
// and aliases internal to the spectral:oas/asyncapi rulesets, so they can only be
// re-leveled by NAME (a severity string) — never redefined inline.
const ruleNames = (rs) => Object.keys(rs?.rules ?? {});
const recommendedNames = (rs) => Object.entries(rs?.rules ?? {}).filter(([, r]) => r?.recommended !== false).map(([n]) => n);
const builtinRulesByFormat = { openapi: ruleNames(oas), asyncapi: ruleNames(asyncapi) };
const builtinRecommendedByFormat = { openapi: recommendedNames(oas), asyncapi: recommendedNames(asyncapi) };

// The artifact formats the ruleset knows, in a friendly order.
export const FORMATS = Object.keys(ALL_RULES);

// Accept common synonyms for a format name (what an AI client is likely to say).
const FORMAT_SYNONYMS = {
  oas: 'openapi', oas3: 'openapi', 'oas3.0': 'openapi', 'oas3.1': 'openapi', openapi3: 'openapi', swagger: 'openapi',
  async: 'asyncapi', 'async-api': 'asyncapi',
  'json-schema': 'jsonschema', jsonschema: 'jsonschema',
  apisjson: 'apis-json', 'apis.json': 'apis-json',
  'agent-skill': 'agent-skill', skill: 'agent-skill', skills: 'agent-skill',
  'json-ld': 'json-ld', jsonld: 'json-ld', 'json-structure': 'json-structure',
  'rate-limits': 'rate-limits', ratelimits: 'rate-limits',
};
function resolveFormat(name) {
  if (!name) return 'openapi';
  const key = String(name).toLowerCase();
  const mapped = FORMAT_SYNONYMS[key] ?? key;
  return ALL_RULES[mapped] ? mapped : 'openapi';
}

// Strip catalog-only metadata the lint engine doesn't understand (provenance,
// display title, docs reference, remediation prompt, internal _format).
function engineRule(r) {
  const { source, title, reference, prompt, _format, ...rest } = r;
  return rest;
}

// Every custom/built-in function a rule's `then` references, as names.
function thenFunctionNames(then) {
  const arr = Array.isArray(then) ? then : [then];
  return arr.filter(Boolean).map((t) => t?.function).filter((f) => typeof f === 'string');
}
// An inline rule is runnable only if every function it names resolves. A few catalog
// rules reference functions internal to the engine rulesets (or, for agent-skill,
// helpers that were never shipped); we drop those individually so one unrunnable rule
// can't fail the whole format.
function ruleIsRunnable(rule) {
  return thenFunctionNames(rule?.then).every((fn) => FN_MAP[fn] != null);
}

// Normalize ruleset `formats:` strings to the format-function export names.
const FMT_ALIASES = {
  'oas3.0': 'oas3_0', 'oas3.1': 'oas3_1', oas31: 'oas3_1', oas30: 'oas3_0',
  'asyncapi2.0': 'aas2_0', asyncapi3: 'asyncApi2', 'json-schema': 'jsonSchema', jsonschema: 'jsonSchema',
};
const lookupFormat = (name) => fmts[FMT_ALIASES[name] ?? name] ?? fmts[name];

// Convert a data-form ruleset (string functions/formats) to the JS form that
// `new Ruleset()` expects (resolved function/format objects). `extends` is handled
// separately and left untouched here.
function toJsForm(node) {
  if (Array.isArray(node)) return node.map(toJsForm);
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === 'function' && typeof v === 'string') out[k] = FN_MAP[v] ?? v;
      else if (k === 'formats' && Array.isArray(v)) out[k] = v.map((f) => (typeof f === 'string' ? lookupFormat(f) : f)).filter(Boolean);
      else out[k] = toJsForm(v);
    }
    return out;
  }
  return node;
}

// Replace string extends (e.g. "spectral:oas") with the imported ruleset object.
function resolveExtendsList(ext) {
  if (ext == null) return undefined;
  const list = Array.isArray(ext) ? ext : [ext];
  return list.map((entry) => {
    if (typeof entry === 'string') return BUILTIN_RULESETS[entry] ?? entry;
    if (Array.isArray(entry) && typeof entry[0] === 'string') return [BUILTIN_RULESETS[entry[0]] ?? entry[0], entry[1]];
    return entry;
  });
}

// Build a JS-form Ruleset from a (possibly data-form) definition.
function buildRuleset(def) {
  const { extends: ext, ...rest } = def ?? {};
  const jsRest = toJsForm(rest);
  const resolved = resolveExtendsList(ext);
  const full = resolved ? { ...jsRest, extends: resolved } : jsRest;
  return new Ruleset(full, { source: 'api-governance-mcp' });
}

// The data-form ruleset definition for one artifact format, matching what the API
// Validator runs: the curated catalog rules inline, plus the extended engine rules
// re-leveled by name. Built-in rules (source: builtin) and duplicates are NOT emitted
// as data — they arrive through `extends` and are only re-leveled by severity string.
export function rulesetDefForFormat(fmt) {
  const rules = {};
  for (const [name, rule] of Object.entries(ALL_RULES[fmt] ?? {})) {
    if (rule.source === 'builtin') continue;
    const tags = Array.isArray(rule.tags) ? rule.tags : [];
    if (tags.includes('duplicate:true')) continue;
    if (!ruleIsRunnable(rule)) continue;
    rules[name] = engineRule(rule);
  }
  // We don't support Swagger / OpenAPI 2.0 — turn off oas2 rules; re-level every other
  // recommended built-in to `warn`. Non-recommended built-ins stay dormant.
  const recommended = new Set(builtinRecommendedByFormat[fmt] ?? []);
  for (const name of builtinRulesByFormat[fmt] ?? []) {
    if (/^oas2[-_]/i.test(name)) rules[name] = 'off';
    else if (recommended.has(name)) rules[name] = 'warn';
  }
  const ext = EXTENDS_FOR[fmt];
  return ext ? { extends: ext, rules } : { rules };
}

const engine = new Spectral();

/**
 * Lint `content` (a YAML or JSON string) against the best-of-breed ruleset for
 * `format`, or against a caller-supplied `ruleset` definition. Returns { diagnostics, counts }.
 */
export async function lint(content, { format, ruleset, source = 'artifact' } = {}) {
  const def = ruleset != null
    ? (typeof ruleset === 'string' ? parseYaml(ruleset) : ruleset)
    : rulesetDefForFormat(resolveFormat(format));
  engine.setRuleset(buildRuleset(def));
  const results = await engine.run(new Document(content, Parsers.Yaml, source));
  const diagnostics = results.map((d) => ({
    code: String(d.code),
    message: d.message,
    severity: ['error', 'warn', 'info', 'hint'][d.severity] ?? 'warn',
    path: Array.isArray(d.path) ? d.path.join('.') : undefined,
    range: d.range,
  }));
  const counts = { error: 0, warn: 0, info: 0, hint: 0 };
  for (const d of diagnostics) counts[d.severity] = (counts[d.severity] ?? 0) + 1;
  return { diagnostics, counts };
}

// List the artifact formats and, for each, the rule names it lints (catalog rules;
// built-in engine rules for openapi/asyncapi come from the extended spectral ruleset).
export function listRulesets() {
  return FORMATS.map((format) => ({
    format,
    extends: EXTENDS_FOR[format] ?? null,
    ruleCount: Object.keys(ALL_RULES[format] ?? {}).length,
    rules: Object.keys(ALL_RULES[format] ?? {}),
  }));
}

// One rule's full catalog entry (title, description, severity, tags, remediation
// prompt) — resolved across every format so callers can look a finding's code up.
export function describeRule(code) {
  for (const [format, rules] of Object.entries(ALL_RULES)) {
    if (rules[code]) return { format, name: code, ...rules[code] };
  }
  return null;
}
