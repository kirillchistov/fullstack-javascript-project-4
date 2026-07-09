// поток построен на .then(): загрузка, создание директории, запись файла и возврат пути.
// шаг 4: добавил селкторы и обработку остальных ресурсов.
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { load } from 'cheerio';
import {
  getOutputPath,
  getResourcesDirname,
  getResourceFilename,
  isLocalResource,
} from './utils.js';

const resourceSelectors = [
  { tag: 'img', attr: 'src' },
  { tag: 'script', attr: 'src' },
  { tag: 'link', attr: 'href' },
];

const loadResource = (resourceUrl, resourcePath) => axios
  .get(resourceUrl, { responseType: 'arraybuffer' })
  .then((response) => fs.writeFile(resourcePath, response.data));

const pageLoader = (url, outputDir = process.cwd()) => axios.get(url)
  .then((response) => {
    const html = response.data;
    const filePath = getOutputPath(outputDir, url);
    const resourcesDirname = getResourcesDirname(url);
    const resourcesDirpath = path.join(outputDir, resourcesDirname);
    const $ = load(html);

    const resources = resourceSelectors.flatMap(({ tag, attr }) => (
      $(`${tag}[${attr}]`).toArray().map((element) => {
        const value = $(element).attr(attr);
        return { element, attr, value };
      })
    ))
      .filter(({ value }) => value)
      .filter(({ value }) => isLocalResource(url, value));

    const uniqueResources = [...new Map(
      resources.map((resource) => [new URL(resource.value, url).toString(), resource]),
    ).values()];

    return fs.mkdir(resourcesDirpath, { recursive: true })
      .then(() => Promise.all(uniqueResources.map(({ value }) => {
        const absoluteUrl = new URL(value, url).toString();
        const filename = getResourceFilename(url, absoluteUrl);
        const filepath = path.join(resourcesDirpath, filename);

        return loadResource(absoluteUrl, filepath)
          .then(() => {
            resources
              .filter((resource) => new URL(resource.value, url).toString() === absoluteUrl)
              .forEach(({ element, attr }) => {
                $(element).attr(attr, path.posix.join(resourcesDirname, filename));
              });
          });
      })))
      .then(() => fs.writeFile(filePath, $.html()))
      .then(() => filePath);
  });

export default pageLoader;