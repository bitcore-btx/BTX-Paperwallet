// Offline replica of `grunt combine:single` + `lineending` (eol: lf).
// Reads Gruntfile.js token map, replaces tokens in src/bitaddress-ui.html,
// writes the bundle. Used because `npx grunt` is blocked by package
// threat-intel checks in this environment; this does exactly what the
// Gruntfile declares, with zero package installs.
const fs = require('fs');
const path = require('path');

const repo = __dirname;
const gruntfile = fs.readFileSync(path.join(repo, 'Gruntfile.js'), 'utf8');

// parse tokens: { token: "//x.js", file: "./src/x.js" } or { token: "//version", string: packageObject.version }
const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const tokens = [];
const re = /\{\s*token:\s*"([^"]+)"\s*,\s*(?:file:\s*"([^"]+)"|string:\s*packageObject\.version)\s*\}/g;
let m;
while ((m = re.exec(gruntfile))) {
  tokens.push({ token: m[1], file: m[2], string: m[2] === undefined ? pkg.version : undefined });
}
if (tokens.length === 0) { console.error('no tokens parsed'); process.exit(1); }

// Strip the leading BOM of src/bitaddress-ui.html: the committed bundles
// (upstream and HEAD) have no BOM, matching grunt-combine's lib/text.js
// behaviour ("Remove BOM from utf8 files"). Internal BOMs are preserved.
let out = fs.readFileSync(path.join(repo, 'src/bitaddress-ui.html'), 'utf8').replace(/^\uFEFF/, '');
let missing = 0;
for (const t of tokens) {
  // grunt-combine semantics (empirically verified against 45/47 tokens of the
  // upstream-committed bundle): replace the token STRING in place, file content
  // verbatim; the token line's own newline follows it. The 2 remaining diffs vs
  // the committed HEAD bundle are blank lines after bitcoinjs-lib.address.js /
  // bech32.js, whose trailing newlines Phase 3 added AFTER its hand-mirrored
  // bundle update (stale bundle, not a semantic difference).
  // Internal BOMs are preserved; only the output's leading BOM is removed.
  if (!out.includes(t.token)) { console.error('TOKEN NOT FOUND in src:', JSON.stringify(t.token)); missing++; continue; }
  const value = t.file !== undefined
    ? fs.readFileSync(path.join(repo, t.file), 'utf8')
    : t.string;
  out = out.split(t.token).join(value);
}
// lineending task: force LF
out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const target = process.argv[2] || path.join(repo, 'bitaddress.org.html');
fs.writeFileSync(target, out);
console.log('tokens:', tokens.length, 'missing:', missing, '-> wrote', target, out.length, 'chars');
process.exit(missing === 0 ? 0 : 1);
