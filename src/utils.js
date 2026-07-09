// принять URL и директорию вывода;
// скачать страницу; сгенерировать имя файла;
// записать HTML; вернуть полный путь к сохранённому файлу.
// нормализовать URL для использования в качестве имени файла (убрать спецсимволы, заменить на md5 hash);
// определить, является ли ресурс локальным; сгенерировать имя файла ресурса; вернуть путь к ресурсу.
// учесть доменные имена и пути ресурсов, html тоже должен быть в resources.

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

const getBaseDomain = (hostname) => hostname.split('.').slice(-2).join('.');

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

  return page.hostname === resource.hostname;
};

export const getResourceFilename = (pageUrl, resourceUrl) => {
  const page = new URL(pageUrl);
  const resource = new URL(resourceUrl, pageUrl);

  const detectedExt = path.extname(resource.pathname);
  const ext = detectedExt || '.html';
  const resourcePathWithoutExt = detectedExt
    ? resource.pathname.slice(0, -detectedExt.length)
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
