// nock перехватывает HTTP-запросы и позволяет тестировать сетевое поведение без реального интернета. 
// Для изоляции временная директория через fs.mkdtemp() создаётся на каждый тест.
// Для асинхронных тестов Jest требует вернуть промис или использовать async/await, 
// иначе тест может завершиться раньше времени.

import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import nock from 'nock';
import pageLoader from '../src/pageLoader.js';

describe('pageLoader', () => {
  let tempDir;

  const url = 'https://ru.hexlet.io/courses';

  const htmlBefore = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <title>Курсы по программированию Хекслет</title>
    <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">
    <link rel="stylesheet" media="all" href="/assets/application.css" />
    <link href="/courses" rel="canonical">
  </head>
  <body>
    <img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" />
    <h3>
      <a href="/professions/nodejs">Node.js-программист</a>
    </h3>
    <script src="https://js.stripe.com/v3/"></script>
    <script src="https://ru.hexlet.io/packs/js/runtime.js"></script>
  </body>
</html>`;

  const htmlAfter = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <title>Курсы по программированию Хекслет</title>
    <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">
    <link rel="stylesheet" media="all" href="ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css">
    <link href="ru-hexlet-io-courses_files/ru-hexlet-io-courses.html" rel="canonical">
  </head>
  <body>
    <img src="ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png" alt="Иконка профессии Node.js-программист">
    <h3>
      <a href="/professions/nodejs">Node.js-программист</a>
    </h3>
    <script src="https://js.stripe.com/v3/"></script>
    <script src="ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js"></script>
  </body>
</html>`;

  const imageBuffer = Buffer.from('image content');
  const cssContent = 'body { color: #333; }';
  const jsContent = 'console.log("runtime loaded");';
  const canonicalContent = '<html><body>Courses page</body></html>';

  const normalizeHtml = (html) => html
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('downloads page resources and rewrites html', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, htmlBefore)
      .get('/assets/application.css')
      .reply(200, cssContent)
      .get('/courses')
      .reply(200, canonicalContent)
      .get('/assets/professions/nodejs.png')
      .reply(200, imageBuffer)
      .get('/packs/js/runtime.js')
      .reply(200, jsContent);

    nock('https://cdn2.hexlet.io')
      .get('/assets/menu.css')
      .reply(200, 'external css');

    nock('https://js.stripe.com')
      .get('/v3/')
      .reply(200, 'external script');

    const htmlPath = await pageLoader(url, tempDir);
    const resourcesDir = path.join(tempDir, 'ru-hexlet-io-courses_files');

    const savedHtml = await fs.readFile(htmlPath, 'utf-8');
    const savedImage = await fs.readFile(
      path.join(resourcesDir, 'ru-hexlet-io-assets-professions-nodejs.png'),
    );
    const savedCss = await fs.readFile(
      path.join(resourcesDir, 'ru-hexlet-io-assets-application.css'),
      'utf-8',
    );
    const savedJs = await fs.readFile(
      path.join(resourcesDir, 'ru-hexlet-io-packs-js-runtime.js'),
      'utf-8',
    );
    const savedCanonical = await fs.readFile(
      path.join(resourcesDir, 'ru-hexlet-io-courses.html'),
      'utf-8',
    );

    expect(normalizeHtml(savedHtml)).toBe(normalizeHtml(htmlAfter));
    expect(savedImage).toEqual(imageBuffer);
    expect(savedCss).toBe(cssContent);
    expect(savedJs).toBe(jsContent);
    expect(savedCanonical).toBe(canonicalContent);
  });
});
