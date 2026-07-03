# API Governance MCP

A [Model Context Protocol](https://modelcontextprotocol.io) server that lets **any AI
client** lint your API artifacts against a best-of-breed **API governance ruleset** —
so an agent can check your OpenAPI (**3.x _and_ Swagger 2.0**), AsyncAPI, Arazzo,
APIs.json, JSON Schema, MCP, and more, conversationally, and tell you what to fix.

Powered by **[Spectral](https://github.com/stoplightio/spectral)**. It runs the same
engine and the same compiled ruleset (`rules/all-rules.yaml`) as the [API Commons **API
Validator**](https://validator.apicommons.org) — the browser tool — here server-side
over stdio. The ruleset is compiled from public Spectral rulesets and the
[API Evangelist](https://apievangelist.com) governance rules: **769 rules across 12
artifact formats**, of which the **`openapi` group is 462 rules**. Every rule ships at
`info` to educate; raise individual rules to `warn`/`error` with a custom ruleset for
what you choose to enforce.

**Swagger 2.0 at parity with OpenAPI 3.x.** The `openapi` catalog governs
`swagger: "2.0"` documents exactly as it governs `openapi: 3.x` — Spectral
auto-detects each document's format and runs the matching rules (twins and
format-gating mean nothing false-positives across versions). The server maps the
`swagger` format synonym to `openapi`, so a client can say either.

## Tools

| Tool | What it does |
| --- | --- |
| `lint_artifact` | Lint an artifact (`content`, optional `format`, optional custom `ruleset`) → findings (code, message, severity, path) + counts |
| `list_rulesets` | The artifact formats it governs and, per format, the rules it applies |
| `list_formats` | The artifact formats the ruleset can lint |
| `describe_rule` | Look a finding's `code` up → title, description, severity, tags, target path, and a remediation prompt |
| `validate_ruleset` | Structurally validate a custom Spectral ruleset before you lint with it |
| `request_review` | Get a ready-to-send email to engage [API Evangelist](https://apievangelist.com/services/) for expert governance services |

### Formats

`openapi` · `asyncapi` · `arazzo` · `apis-json` · `jsonschema` · `json-structure` ·
`json-ld` · `mcp` · `plans` · `rate-limits` · `finops` · `agent-skill`

The `openapi` format covers **both Swagger 2.0 and OpenAPI 3.x** (say `swagger` or
`openapi`). The `openapi` and `asyncapi` rulesets also extend the recommended Spectral
engine rules; every other format is linted entirely by its curated rules.

## Use it

```bash
npm install
npm start          # speaks MCP over stdio
```

### Claude Desktop / any MCP client

Add to your client's MCP server config (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "api-governance": {
      "command": "npx",
      "args": ["-y", "@api-common/api-governance-mcp"]
    }
  }
}
```

Then ask: *"Lint this OpenAPI for governance issues and tell me what to fix."*

## Part of the API Commons tools

Browser-first, backend-free tools for the APIs you produce and consume — **[API
Discovery](https://discovery.apicommons.org)**, **[API
Documentation](https://documentation.apicommons.org)**, **[API
Validator](https://validator.apicommons.org)**, **[API
Reusability](https://reusability.apicommons.org)**, and **[MCP
Install](https://install.apicommons.org)**. This is the **AI surface** of the API
Validator: the same Spectral governance, exposed to any agent over MCP. See them all at
[apicommons.org/tools](https://apicommons.org/tools/).

---

A project of [API Evangelist](https://apievangelist.com), maintained openly under
[API Commons](https://apicommons.org). The tooling is open and free to run yourself;
API Evangelist offers the expert governance services around it. Apache-2.0.
