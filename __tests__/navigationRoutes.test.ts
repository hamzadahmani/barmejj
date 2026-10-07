import {describe, expect, it} from '@jest/globals';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const sourceRoot = path.resolve(__dirname, '../src');
function files(directory: string): string[] {
  return fs
    .readdirSync(directory, {withFileTypes: true})
    .flatMap(entry =>
      entry.isDirectory()
        ? files(path.join(directory, entry.name))
        : /\.tsx?$/.test(entry.name)
        ? [path.join(directory, entry.name)]
        : [],
    );
}
function source(file: string) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}
function visit(node: ts.Node, fn: (node: ts.Node) => void) {
  fn(node);
  ts.forEachChild(node, child => visit(child, fn));
}
function routeNames(file: string) {
  const names: string[] = [];
  visit(source(file), node => {
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText() === 'name' &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    )
      names.push(node.initializer.text);
  });
  return names;
}
describe('registered navigation destinations', () => {
  it('registers every literal navigation destination used by the app', () => {
    const allFiles = files(sourceRoot);
    const names = new Set(
      allFiles
        .filter(file => file.includes(`${path.sep}routes${path.sep}`))
        .flatMap(routeNames),
    );
    const missing: string[] = [];
    for (const file of allFiles)
      visit(source(file), node => {
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ['navigate', 'replace', 'push'].includes(node.expression.name.text) &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          const name = node.arguments[0].text;
          if (
            !names.has(name) &&
            node.expression.expression.getText().includes('navigation')
          )
            missing.push(`${path.relative(sourceRoot, file)}: ${name}`);
        }
      });
    expect(missing).toEqual([]);
  });
  it('keeps Explorer details, favorites, map and reservation routes reachable in its stack', () => {
    expect(
      routeNames(path.join(sourceRoot, 'routes/home/homeStack.tsx')),
    ).toEqual(
      expect.arrayContaining([
        'Categories',
        'HomeScreen',
        'NearMe',
        'FavoriteList',
        'Details',
        'Resevation',
        'ReservationSuccess',
        'ReservationTicket',
      ]),
    );
    expect(routeNames(path.join(sourceRoot, 'routes/home/index.tsx'))).toEqual(
      expect.arrayContaining([
        'Profile',
        'Reservations',
        'Expérience Barmej',
        'Videos',
        'Explorer',
      ]),
    );
    expect(
      routeNames(path.join(sourceRoot, 'routes/home/experienceStack.tsx')),
    ).toEqual(expect.arrayContaining(['Barmejli', 'ExperienceHome']));
  });
});
