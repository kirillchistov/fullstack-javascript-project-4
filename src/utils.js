// принять URL и директорию вывода;
// скачать страницу;
// сгенерировать имя файла;
// записать HTML;
// вернуть полный путь к сохранённому файлу.
import path from 'path';

export const normalizeUrlToFilename = (url) => {
  const parsedUrl = new URL(url);
  const rawName = `${parsedUrl.hostname}${parsedUrl.pathname}`;
  const normalized = rawName
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${normalized}.html`;
};

export const getOutputPath = (outputDir, url) => path.resolve(outputDir, normalizeUrlToFilename(url));

