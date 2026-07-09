import { isLocalResource, getResourceFilename } from '../src/utils.js';

describe('isLocalResource', () => {
  const pageUrl = 'https://ru.hexlet.io/courses';

  test('returns true for relative resource', () => {
    expect(isLocalResource(pageUrl, '/assets/professions/nodejs.png')).toBe(true);
  });

  test('returns true for same host resource', () => {
    expect(isLocalResource(pageUrl, 'https://ru.hexlet.io/assets/professions/nodejs.png')).toBe(true);
  });

  test('returns false for another subdomain resource', () => {
    expect(isLocalResource(pageUrl, 'https://cdn2.hexlet.io/assets/menu.css')).toBe(false);
  });

  test('returns false for external domain resource', () => {
    expect(isLocalResource(pageUrl, 'https://example.com/image.png')).toBe(false);
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

  test('creates html filename for resource without extension', () => {
    const filename = getResourceFilename(
      'https://ru.hexlet.io/courses',
      '/courses',
    );

    expect(filename).toBe('ru-hexlet-io-courses.html');
  });
});