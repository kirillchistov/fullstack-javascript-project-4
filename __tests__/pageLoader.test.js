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

test('downloads page with image and rewrites html', async () => {
  const url = 'https://ru.hexlet.io/courses';
  const htmlBefore = await fs.readFile(path.join('__fixtures__', 'before.html'), 'utf-8');
  const htmlAfter = await fs.readFile(path.join('__fixtures__', 'after.html'), 'utf-8');
  const imageBuffer = Buffer.from('fake-image-data');

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, htmlBefore)
    .get('/assets/professions/nodejs.png')
    .reply(200, imageBuffer, { 'Content-Type': 'image/png' });

  const resultPath = await pageLoader(url, tempDir);
  const savedHtml = await fs.readFile(resultPath, 'utf-8');
  const resourcesDir = path.join(tempDir, 'ru-hexlet-io-courses_files');
  const imagePath = path.join(
    resourcesDir,
    'ru-hexlet-io-assets-professions-nodejs.png',
  );
  const savedImage = await fs.readFile(imagePath);

  const normalizeHtml = (html) => html.replace(/\s+/g, ' ').trim();
  expect(normalizeHtml(savedHtml)).toEqual(normalizeHtml(htmlAfter));
  
  expect(savedImage).toEqual(imageBuffer);
});
