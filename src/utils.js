// принять URL и директорию вывода;
// скачать страницу;
// сгенерировать имя файла;
// записать HTML;
// вернуть полный путь к сохранённому файлу.
import path from 'path';

const normalize = (value) => value
  .replace(/[^a-zA-Z0-9]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

export const normalizeUrlToFilename = (url) => {
  const parsedUrl = new URL(url);
  const rawName = `${parsedUrl.hostname}${parsedUrl.pathname}`;

  return `${normalize(rawName)}.html`;
};

export const getOutputPath = (outputDir, url) => path.resolve(outputDir, normalizeUrlToFilename(url));

export const getResourcesDirname = (url) => normalizeUrlToFilename(url).replace(/\.html$/, '_files');

export const getResourceFilename = (pageUrl, resourceUrl) => {
  const page = new URL(pageUrl);
  const resource = new URL(resourceUrl, pageUrl);
  const ext = path.extname(resource.pathname);
  const basenameWithoutExt = resource.pathname.replace(new RegExp(`${ext}$`), '');
  const rawName = `${page.hostname}${basenameWithoutExt}`;

  return `${normalize(rawName)}${ext}`;
};

export const isLocalResource = (pageUrl, resourceUrl) => {
  const page = new URL(pageUrl);
  const resource = new URL(resourceUrl, pageUrl);

  return page.hostname === resource.hostname;
};

