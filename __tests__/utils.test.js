import { isLocalResource, getResourceFilename } from '../src/utils.js';

describe('isLocalResource', () => {
  const pageUrl = 'https://ru.hexlet.io/courses';

  test('returns true for relative resource', () => {
    expect(isLocalResource(pageUrl, '/assets/professions/nodejs.png')).toBe(true);
  });

  test('returns true for same subdomain resource', () => {
    expect(isLocalResource(pageUrl, 'https://ru.hexlet.io/assets/professions/nodejs.png')).toBe(true);
  });

  test('returns true for main hexlet domain resource', () => {
    expect(isLocalResource(pageUrl, 'https://hexlet.io/assets/professions/nodejs.png')).toBe(true);
  });

  test('returns false for external domain resource', () => {
    expect(isLocalResource(pageUrl, 'https://example.com/assets/professions/nodejs.png')).toBe(false);
  });
});

describe('getResourceFilename', () => {
  test('keeps short readable filename', () => {
    const filename = getResourceFilename(
      'https://ru.hexlet.io/courses',
      '/assets/professions/nodejs.png',
    );

    expect(filename).toBe('ru-hexlet-io-assets-professions-nodejs.png');
  });

  test('shortens very long filenames and preserves extension', () => {
    const filename = getResourceFilename(
      'https://ru.hexlet.io/courses',
      'https://hexlet.io/rails/active_storage/representations/proxy/very-long-long-long-long-long-long-long-long-long-long-long-long-image-name.png',
    );

    expect(filename.endsWith('.png')).toBe(true);
    expect(filename.length).toBeLessThan(120);
  });
});
