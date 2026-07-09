// принять URL и директорию вывода;
// скачать страницу;
// сгенерировать имя файла;
// записать HTML;
// вернуть полный путь к сохранённому файлу.
// нормализовать URL для использования в качестве имени файла (убрать спецсимволы, заменить на md5 hash);

import path from 'path';
import crypto from 'crypto';

const normalize = (value) => value
  .replace(/[^a-zA-Z0-9]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const makeHash = (value) => crypto
  .createHash('md5')
  .update(value)
  .digest('hex')
  .slice(0, 8);

const isHexletDomain = (hostname) => hostname === 'hexlet.io' || hostname.endsWith('.hexlet.io');

export const normalizeUrlToFilename = (url) => {
  const parsedUrl = new URL(url);
  const rawName = `${parsedUrl.hostname}${parsedUrl.pathname}`;

  return `${normalize(rawName)}.html`;
};

export const getOutputPath = (outputDir, url) => path.resolve(
  outputDir,
  normalizeUrlToFilename(url),
);

export const getResourcesDirname = (url) => normalizeUrlToFilename(url)
  .replace(/\.html$/, '_files');

export const isLocalResource = (pageUrl, resourceUrl) => {
  const page = new URL(pageUrl);
  const resource = new URL(resourceUrl, pageUrl);

  return isHexletDomain(page.hostname) && isHexletDomain(resource.hostname);
};

export const getResourceFilename = (pageUrl, resourceUrl) => {
  const page = new URL(pageUrl);
  const resource = new URL(resourceUrl, pageUrl);

  const ext = path.extname(resource.pathname) || '.html';
  const resourcePathWithoutExt = resource.pathname.endsWith(ext)
    ? resource.pathname.slice(0, -ext.length)
    : resource.pathname;

  const rawName = `${page.hostname}${resourcePathWithoutExt}`;
  const normalized = normalize(rawName);
  const maxBaseLength = 100;

  if (normalized.length <= maxBaseLength) {
    return `${normalized}${ext}`;
  }

  const shortName = normalized.slice(0, maxBaseLength);
  const hash = makeHash(resource.toString());

  return `${shortName}-${hash}${ext}`;
};
