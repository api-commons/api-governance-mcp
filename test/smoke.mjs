// Smoke test: drive the MCP server over stdio — initialize, tools/list, lint call.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const srv = spawn('node', ['src/server.mjs'], { cwd: ROOT, stdio: ['pipe', 'pipe', 'inherit'] });
let buf = ''; const got = [];
srv.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.trim()) got.push(JSON.parse(l)); } });
const send = (m) => srv.stdin.write(JSON.stringify(m) + '\n');
send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 't', version: '1' } } });
send({ jsonrpc: '2.0', method: 'notifications/initialized' });
setTimeout(() => send({ jsonrpc: '2.0', id: 2, method: 'tools/list' }), 300);
setTimeout(() => send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'lint_artifact', arguments: { format: 'openapi', content: 'openapi: "3.0.3"\ninfo: {title: T, version: "1"}\npaths:\n  /v1/things:\n    get: {responses: {"200": {description: ok}}}\n' } } }), 600);
setTimeout(() => send({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'describe_rule', arguments: { code: 'path-no-version-segment' } } }), 900);
setTimeout(() => {
  srv.kill();
  const tools = got.find((g) => g.id === 2)?.result?.tools?.map((t) => t.name) || [];
  const call = JSON.parse(got.find((g) => g.id === 3)?.result?.content?.[0]?.text || '{}');
  const rule = JSON.parse(got.find((g) => g.id === 4)?.result?.content?.[0]?.text || '{}');
  const ok = got.find((g) => g.id === 1)?.result
    && ['lint_artifact', 'list_rulesets', 'list_formats', 'describe_rule', 'validate_ruleset', 'request_review'].every((t) => tools.includes(t))
    && typeof call.total === 'number'
    && rule.name === 'path-no-version-segment';
  console.log('tools:', tools.join(', '));
  console.log('lint findings:', call.total, '| counts:', JSON.stringify(call.counts));
  console.log('describe_rule ok:', rule.name === 'path-no-version-segment');
  if (!ok) { console.error('SMOKE FAILED'); process.exit(1); }
  console.log('smoke ok');
  process.exit(0);
}, 1600);
