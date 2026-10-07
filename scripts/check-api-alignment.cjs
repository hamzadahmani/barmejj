const fs = require('fs'),
  path = require('path'),
  ts = require('typescript');
const back = process.argv[2];
if (!back)
  throw new Error(
    'Usage: node scripts/check-api-alignment.cjs <backend-directory> [pro-directory]',
  );
const roots = [
  path.resolve(__dirname, '..'),
  path.resolve(process.argv[3] || path.join(__dirname, '../../BarmejPro')),
];
function files(dir) {
  return fs
    .readdirSync(dir, {withFileTypes: true})
    .flatMap(e =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : /\.tsx?$/.test(e.name)
        ? [path.join(dir, e.name)]
        : [],
    );
}
function literal(node, bindings = new Map(), seen = new Set()) {
  if (!node) return null;
  if (ts.isIdentifier(node) && bindings.has(node.text) && !seen.has(node.text)) {
    return literal(bindings.get(node.text), bindings, new Set([...seen, node.text]));
  }
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isTemplateExpression(node))
    return (
      node.head.text +
      node.templateSpans.map(s => (literal(s.expression, bindings, seen) ?? ':') + s.literal.text).join('')
    );
  return null;
}
const norm = s =>
  ('/' + s.replace(/^\//, ''))
    .split('?')[0]
    .replace(/:[^/]+/g, ':')
    .replace(/\/$/, '');
const routes = new Set();
for (const file of files(back + '/src')) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(n) {
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
      const {expression: obj, name} = n.expression;
      if (
        ['app', 'router', 'barmejliRouter'].includes(obj.getText(source)) &&
        ['get', 'post', 'put', 'patch', 'delete'].includes(name.text)
      ) {
        const route = literal(n.arguments[0]);
        if (route !== null)
          routes.add(
            name.text.toUpperCase() +
              ' ' +
              norm(
                (file.endsWith('discovery.ts')
                  ? '/v1/discovery'
                  : file.endsWith('barmejli.ts')
                  ? '/v1/barmejli'
                  : file.endsWith('menus.ts')
                  ? '/pro/places/:placeId/menus'
                  : '') + route,
              ),
          );
      }
    }
    ts.forEachChild(n, visit);
  }
  visit(source);
}
const checks = [],
  dynamic = [];
for (const root of roots)
  for (const file of files(root + '/src')) {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const bindings = new Map();
    function collect(n) {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
        bindings.set(n.name.text, n.initializer);
      }
      ts.forEachChild(n, collect);
    }
    collect(source);
    function visit(n) {
      if (ts.isCallExpression(n)) {
        let method;
        if (ts.isIdentifier(n.expression) && n.expression.text === 'api') {
          method = 'GET';
          const init = n.arguments[1];
          if (init && ts.isObjectLiteralExpression(init))
            for (const p of init.properties)
              if (
                ts.isPropertyAssignment(p) &&
                p.name.getText(source) === 'method'
              )
                method = literal(p.initializer) || 'DYNAMIC';
        } else if (
          ts.isPropertyAccessExpression(n.expression) &&
          ['axios', 'request', 'instance'].includes(
            n.expression.expression.getText(source),
          ) &&
          ['get', 'post', 'put', 'patch', 'delete'].includes(
            n.expression.name.text,
          )
        )
          method = n.expression.name.text.toUpperCase();
        if (method) {
          const route = literal(n.arguments[0], bindings)?.replace(
            /^:\/auth\//,
            '/auth/',
          );
          const location = {
            app: path.basename(root),
            file: path.relative(root, file),
            line: source.getLineAndCharacterOfPosition(n.getStart()).line + 1,
          };
          if (route != null && !route.startsWith('http')) {
            const endpoint = method + ' ' + norm(route);
            checks.push({...location, endpoint, found: routes.has(endpoint)});
          } else
            dynamic.push({
              ...location,
              expression: n.arguments[0]?.getText(source),
            });
        }
      }
      ts.forEachChild(n, visit);
    }
    visit(source);
  }
const report = {
  checked: checks.length,
  matched: checks.filter(x => x.found).length,
  unmatched: checks.filter(x => !x.found),
  dynamic,
};
if (report.unmatched.length) process.exitCode = 1;
console.log(JSON.stringify(report, null, 2));
