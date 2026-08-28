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

// react-native-image-picker 7.1.0 hard-codes Android SDK 33, while
// React Native 0.87 and its Android dependencies require SDK 34+.
const imagePickerGradle = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-image-picker',
  'android',
  'build.gradle',
);

if (fs.existsSync(imagePickerGradle)) {
  const source = fs.readFileSync(imagePickerGradle, 'utf8');
  const fixed = source
    .replace(
      /compileSdkVersion\s+33/g,
      'compileSdkVersion rootProject.ext.compileSdkVersion',
    )
    .replace(
      /targetSdkVersion\s+33/g,
      'targetSdkVersion rootProject.ext.targetSdkVersion',
    );
  if (fixed !== source) {
    fs.writeFileSync(imagePickerGradle, fixed);
    changedFiles += 1;
  }
}

console.log(`NativeBase RN 0.87 compatibility: ${changedFiles} file(s) updated.`);
