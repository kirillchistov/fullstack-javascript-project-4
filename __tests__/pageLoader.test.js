// nock перехватывает HTTP-запросы и позволяет тестировать сетевое поведение без реального интернета. 
// Для изоляции временная директория через fs.mkdtemp() создаётся на каждый тест.
// Для асинхронных тестов Jest требует вернуть промис или использовать async/await, 
// иначе тест может завершиться раньше времени.

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../src/pageLoader.js';

let tempDir;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterEach(() => {
  nock.cleanAll();
});

test('downloads page into specified directory', async () => {
  const url = 'https://ru.hexlet.io/courses';
  const expectedFilename = 'ru-hexlet-io-courses.html';
  const expectedPath = path.join(tempDir, expectedFilename);
  const html = '<html><body>Hello</body></html>';

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html);

  const resultPath = await pageLoader(url, tempDir);
  const savedContent = await fs.readFile(expectedPath, 'utf-8');

  expect(resultPath).toBe(expectedPath);
  expect(savedContent).toBe(html);
});

test('creates file with normalized name', async () => {
  const url = 'https://ru.hexlet.io/courses';
  const html = '<html><body>Hexlet</body></html>';

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html);

  const resultPath = await pageLoader(url, tempDir);

  expect(path.basename(resultPath)).toBe('ru-hexlet-io-courses.html');
});

test('rejects on network error', async () => {
  const url = 'https://ru.hexlet.io/courses';

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(500);

  await expect(pageLoader(url, tempDir)).rejects.toThrow();
});
