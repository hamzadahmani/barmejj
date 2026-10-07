const pick = require('lodash.pick');

describe('NativeBase pick compatibility', () => {
  it('preserves flat and nested selection without mutating the input', () => {
    const source = {margin: 4, color: 'white', theme: {accent: 'purple'}};
    expect(pick(source, ['margin', 'theme.accent'])).toEqual({
      margin: 4,
      theme: {accent: 'purple'},
    });
    expect(source.color).toBe('white');
  });

  it('does not write through prototype or constructor paths', () => {
    const malicious = JSON.parse(
      '{"__proto__":{"barmejPolluted":true},"constructor":{"prototype":{"barmejPolluted":true}},"margin":4}',
    );
    const result = pick(malicious, [
      '__proto__.barmejPolluted',
      'constructor.prototype.barmejPolluted',
      'margin',
    ]);
    expect(Object.prototype).not.toHaveProperty('barmejPolluted');
    expect(result).toEqual({margin: 4});
  });
});
