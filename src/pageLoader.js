// поток построен на .then(): загрузка, создание директории, запись файла и возврат пути.
// шаг 4: добавил селкторы и обработку остальных ресурсов.
// шаг 5: добавил логирование.
import 'axios-debug-log/enable.js';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { load } from 'cheerio';
import debug from 'debug';
import {
  getOutputPath,
  getResourcesDirname,
  getResourceFilename,
  isLocalResource,
} from './utils.js';

const log = debug('page-loader');

const resourceSelectors = [
  { tag: 'img', attr: 'src' },
  { tag: 'script', attr: 'src' },
  { tag: 'link', attr: 'href' },
];

const loadResource = (resourceUrl, resourcePath) => {
  log('downloading resource: %s -> %s', resourceUrl, resourcePath);

  return axios
    .get(resourceUrl, { responseType: 'arraybuffer' })
    .then((response) => fs.writeFile(resourcePath, response.data))
    .then(() => {
      log('resource saved: %s', resourcePath);
    });
};

const pageLoader = (url, outputDir = process.cwd()) => {
  const filePath = getOutputPath(outputDir, url);
  const resourcesDirname = getResourcesDirname(url);
  const resourcesDirpath = path.join(outputDir, resourcesDirname);

  log('start loading page: %s', url);
  log('output html path: %s', filePath);
  log('resources dir path: %s', resourcesDirpath);

  return axios.get(url)
    .then((response) => {
      const html = response.data;
      const $ = load(html);

      const resources = resourceSelectors.flatMap(({ tag, attr }) => (
        $(`${tag}[${attr}]`).toArray().map((element) => {
          const value = $(element).attr(attr);
          return {
            element,
            attr,
            value,
            absoluteUrl: value ? new URL(value, url).toString() : null,
          };
        })
      ))
        .filter(({ value }) => value)
        .filter(({ value, absoluteUrl }) => {
          const isLocal = isLocalResource(url, value);

          if (isLocal) {
            log('local resource found: %s -> %s', value, absoluteUrl);
          } else {
            log('external resource skipped: %s -> %s', value, absoluteUrl);
          }

          return isLocal;
        });

      const uniqueResources = [...new Map(
        resources.map((resource) => [resource.absoluteUrl, resource]),
      ).values()];

      log('local resources count: %d', uniqueResources.length);
      log('local resources list: %o', uniqueResources.map(({ absoluteUrl }) => absoluteUrl));

      return fs.mkdir(resourcesDirpath, { recursive: true })
        .then(() => {
          log('resources dir created: %s', resourcesDirpath);

          return Promise.all(uniqueResources.map(({ absoluteUrl }) => {
            const filename = getResourceFilename(url, absoluteUrl);
            const filepath = path.join(resourcesDirpath, filename);

            log('mapped resource: %s -> %s', absoluteUrl, filename);

            return loadResource(absoluteUrl, filepath)
              .then(() => {
                resources
                  .filter((resource) => resource.absoluteUrl === absoluteUrl)
                  .forEach(({ element, attr }) => {
                    const localPath = path.posix.join(resourcesDirname, filename);
                    $(element).attr(attr, localPath);
                    log('html rewritten: %s="%s"', attr, localPath);
                  });
              });
          }));
        })
        .then(() => {
          const resultHtml = $.html();
          log('saving html file: %s', filePath);

          return fs.writeFile(filePath, resultHtml);
        })
        .then(() => {
          log('page saved successfully: %s', filePath);
          return filePath;
        });
    })
    .catch((error) => {
      log('page loading failed: %O', {
        message: error.message,
        code: error.code,
        url,
      });
      throw error;
    });
};

export default pageLoader;