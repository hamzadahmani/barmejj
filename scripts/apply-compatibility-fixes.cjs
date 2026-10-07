const fs = require('fs');
const path = require('path');

const roots = [
  path.join(__dirname, '..', 'node_modules', 'native-base', 'src'),
  path.join(__dirname, '..', 'node_modules', 'native-base', 'lib', 'commonjs'),
  path.join(__dirname, '..', 'node_modules', 'native-base', 'lib', 'module'),
];

let changedFiles = 0;

function visit(target) {
  if (!fs.existsSync(target)) return;
  for (const entry of fs.readdirSync(target, {withFileTypes: true})) {
    const file = path.join(target, entry.name);
    if (entry.isDirectory()) {
      visit(file);
      continue;
    }
    if (!/\.(js|jsx|ts|tsx)$/.test(entry.name)) continue;

    const source = fs.readFileSync(file, 'utf8');
    const fixed = source.replace(
      /outlineWidth:\s*(['"])(\d+)(?:px)?\1/g,
      (_match, _quote, width) => `outlineWidth: ${Number(width)}`,
    );
    if (fixed !== source) {
      fs.writeFileSync(file, fixed);
      changedFiles += 1;
    }
  }
}

roots.forEach(visit);

const backHandlerFiles = [
  path.join(roots[0], 'hooks', 'useKeyboardDismissable.ts'),
  path.join(roots[1], 'hooks', 'useKeyboardDismissable.js'),
  path.join(roots[2], 'hooks', 'useKeyboardDismissable.js'),
];

for (const file of backHandlerFiles) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  const prefix = file.includes(`${path.sep}commonjs${path.sep}`)
    ? '_reactNative.BackHandler'
    : 'BackHandler';
  const pattern = new RegExp(
    `if \\(enabled\\) \\{\\s*${prefix.replace('.', '\\.')}\\.addEventListener\\('hardwareBackPress', backHandler\\);\\s*\\} else \\{\\s*${prefix.replace('.', '\\.')}\\.removeEventListener\\('hardwareBackPress', backHandler\\);\\s*\\}\\s*return \\(\\) =>\\s*${prefix.replace('.', '\\.')}\\.removeEventListener\\('hardwareBackPress', backHandler\\);`,
  );
  const fixed = source.replace(
    pattern,
    `const subscription = enabled\n      ? ${prefix}.addEventListener('hardwareBackPress', backHandler)\n      : undefined;\n\n    return () => subscription?.remove();`,
  );
  if (fixed !== source) {
    fs.writeFileSync(file, fixed);
    changedFiles += 1;
  }
}

// image-size v2 fixes malformed-image parser vulnerabilities. Its API accepts
// buffers only, while Metro 0.87 still passes a filename in getAssetData.
const metroAssetsFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'metro',
  'src',
  'Assets.js',
);
if (fs.existsSync(metroAssetsFile)) {
  const source = fs.readFileSync(metroAssetsFile, 'utf8');
  const fixed = source.replace(
    /const isImageInput = assetInfo\.files\[0\]\.includes\("\.zip\/"\)[\s\S]*?: assetInfo\.files\[0\];/,
    'const isImageInput = _fs.default.readFileSync(assetInfo.files[0]);',
  );
  if (fixed !== source) {
    fs.writeFileSync(metroAssetsFile, fixed);
    changedFiles += 1;
  }
}

console.log(`Dependency compatibility: ${changedFiles} file(s) updated.`);
