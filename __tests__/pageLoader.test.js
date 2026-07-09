// nock перехватывает HTTP-запросы и позволяет тестировать сетевое поведение без реального интернета. 
// Для изоляции временная директория через fs.mkdtemp() создаётся на каждый тест.
// Для асинхронных тестов Jest требует вернуть промис или использовать async/await, 
// иначе тест может завершиться раньше времени.
// Ш6. Добавил тесты для __tests__/pageLoader.test.js. 
// Для rejected promises используем await expect(...).rejects, 
// а для сетевых проблем в nock применяем replyWithError(...)

import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { jest } from '@jest/globals';
import nock from 'nock';
import pageLoader from '../src/pageLoader.js';

describe('pageLoader error handling', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
    jest.restoreAllMocks();
  });

  test('throws on page 404', async () => {
    const url = 'https://ru.hexlet.io/courses';

    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(404, 'Not Found');

    await expect(pageLoader(url, tempDir))
      .rejects
      .toThrow(`Failed to load page ${url}`);
  });

  test('throws on page network error', async () => {
    const url = 'https://ru.hexlet.io/courses';

    nock('https://ru.hexlet.io')
      .get('/courses')
      .replyWithError('Network Error');

    await expect(pageLoader(url, tempDir))
      .rejects
      .toThrow(`Failed to load page ${url}`);
  });

  test('throws when resource loading fails', async () => {
    const url = 'https://ru.hexlet.io/courses';
    const html = `
      <html>
        <head></head>
        <body>
          <img src="/assets/professions/nodejs.png">
        </body>
      </html>
    `;

    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, html);

    nock('https://ru.hexlet.io')
      .get('/assets/professions/nodejs.png')
      .reply(500, 'server error');

    await expect(pageLoader(url, tempDir))
      .rejects
      .toThrow('Failed to load resource https://ru.hexlet.io/assets/professions/nodejs.png');
  });

  test('throws when mkdir fails with permission error', async () => {
    const url = 'https://ru.hexlet.io/courses';
    const html = '<html><body><h1>Hello</h1></body></html>';

    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, html);

    jest.spyOn(fs, 'mkdir')
      .mockRejectedValueOnce(new Error('EACCES: permission denied'));

    await expect(pageLoader(url, tempDir))
      .rejects
      .toThrow(`Failed to create directory ${path.join(tempDir, 'ru-hexlet-io-courses_files')}`);
  });

  test('throws when writing html file fails', async () => {
    const url = 'https://ru.hexlet.io/courses';
    const html = '<html><body><h1>Hello</h1></body></html>';

    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, html);

    jest.spyOn(fs, 'writeFile')
      .mockRejectedValueOnce(new Error('EACCES: permission denied'));

    await expect(pageLoader(url, tempDir))
      .rejects
      .toThrow(`Failed to write file ${path.join(tempDir, 'ru-hexlet-io-courses.html')}`);
  });
});
