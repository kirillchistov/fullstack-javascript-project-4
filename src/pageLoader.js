// поток построен на .then(): загрузка, создание директории, запись файла и возврат пути.
// шаг 4: добавил селкторы и обработку остальных ресурсов.
// шаг 5: добавил логирование.
// шаг 6: добавил обработку ошибок. Библиотека кидает исключения с контекстом URL, ресурса и filepath.
// Axios по умолчанию отклоняет промис для HTTP-статусов вне диапазона 2xx,
// поэтому 404/500 отдельно ловить через validateStatus не требуется.

import 'axios-debug-log/enable.js';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { load } from 'cheerio';
import Listr from 'listr';
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

const wrapError = (message, error) => {
  const wrapped = new Error(`${message}: ${error.message}`);
  wrapped.cause = error;
  return wrapped;
};

const loadResource = async (resourceUrl, resourcePath) => {
  log('downloading resource: %s -> %s', resourceUrl, resourcePath);

  try {
    const response = await axios.get(resourceUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(resourcePath, response.data);
    log('resource saved: %s', resourcePath);
  } catch (error) {
    throw wrapError(`Failed to load resource ${resourceUrl}`, error);
  }
};

const createResourceTasks = (resources, url, resourcesDirpath, resourcesDirname, $) => {
  const uniqueResources = [...new Map(
    resources.map((resource) => [resource.absoluteUrl, resource]),
  ).values()];

  return uniqueResources.map(({ absoluteUrl }) => {
    const filename = getResourceFilename(url, absoluteUrl);
    const filepath = path.join(resourcesDirpath, filename);

    return {
      title: `Downloading ${absoluteUrl}`,
      task: async () => {
        log('mapped resource: %s -> %s', absoluteUrl, filename);

        await loadResource(absoluteUrl, filepath);

        resources
          .filter((resource) => resource.absoluteUrl === absoluteUrl)
          .forEach(({ element, attr }) => {
            const localPath = path.posix.join(resourcesDirname, filename);
            $(element).attr(attr, localPath);
            log('html rewritten: %s="%s"', attr, localPath);
          });
      },
    };
  });
};

const ensureOutputDirExists = async (outputDir) => {
  try {
    const stat = await fs.stat(outputDir);

    if (!stat.isDirectory()) {
      throw new Error(`${outputDir} is not a directory`);
    }
  } catch (error) {
    throw wrapError(`Failed to access output directory ${outputDir}`, error);
  }
};

const pageLoader = async (url, outputDir = process.cwd()) => {
  const filePath = getOutputPath(outputDir, url);
  const resourcesDirname = getResourcesDirname(url);
  const resourcesDirpath = path.join(outputDir, resourcesDirname);

  log('start loading page: %s', url);
  log('output html path: %s', filePath);
  log('resources dir path: %s', resourcesDirpath);

  let html;

  try {
    const response = await axios.get(url);
    html = response.data;
  } catch (error) {
    throw wrapError(`Failed to load page ${url}`, error);
  }

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

  log('local resources count: %d', resources.length);

  await ensureOutputDirExists(outputDir);

  try {
    await fs.mkdir(resourcesDirpath);
    log('resources dir created: %s', resourcesDirpath);
  } catch (error) {
    throw wrapError(`Failed to create directory ${resourcesDirpath}`, error);
  }

  const tasks = new Listr([
    {
      title: 'Downloading resources',
      task: () => new Listr(
        createResourceTasks(resources, url, resourcesDirpath, resourcesDirname, $),
        { concurrent: true },
      ),
    },
  ]);

  await tasks.run();

  try {
    await fs.writeFile(filePath, $.html());
    log('page saved successfully: %s', filePath);
    return filePath;
  } catch (error) {
    throw wrapError(`Failed to write file ${filePath}`, error);
  }
};

export default pageLoader;
