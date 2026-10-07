const fs = require('node:fs');
const {Buffer} = require('node:buffer');
const os = require('node:os');
const path = require('node:path');
const {getAssetData} = require(
  path.join(
    path.dirname(require.resolve('metro/package.json')),
    'src/Assets.js',
  ),
);

it('reads a PNG asset through Metro with the patched image-size implementation', async () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'barmej-image-test-'),
  );
  const file = path.join(directory, 'pixel.png');
  try {
    fs.writeFileSync(
      file,
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN6sAAAAASUVORK5CYII=',
        'base64',
      ),
    );
    const asset = await getAssetData(
      file,
      'pixel.png',
      [],
      'android',
      '/assets',
    );
    expect(asset.width).toBe(1);
    expect(asset.height).toBe(1);
  } finally {
    fs.unlinkSync(file);
    fs.rmdirSync(directory);
  }
});
