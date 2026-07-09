// поток построен на .then(): загрузка, создание директории, запись файла и возврат пути.
// шаг 4: добавил селкторы и обработку остальных ресурсов.
// шаг 5: добавил логирование.
// шаг 6: добавил обработку ошибок. Библиотека кидает исключения с контекстом URL, ресурса и filepath.
// Axios по умолчанию отклоняет промис для HTTP-статусов вне диапазона 2xx,
// поэтому 404/500 отдельно ловить через validateStatus не требуется.

import 'axios-debug-log/enable.js';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
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

const validateUrl = (inputUrl) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    throw new Error(`Invalid URL: ${inputUrl}`);
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(`Unsupported protocol: ${parsedUrl.protocol}`);
  }

  if (!parsedUrl.hostname) {
    throw new Error(`Invalid URL: ${inputUrl}`);
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('URL credentials are not allowed');
  }

  return parsedUrl;
};

// const resolveOutputDir = (outputDir) => path.resolve(outputDir);

const validateOutputDirInput = (inputPath) => {
  if (typeof inputPath !== 'string' || inputPath.trim() === '') {
    throw new Error('Output directory must be a non-empty string');
  }

  if (inputPath.includes('\0') || inputPath.includes('%')) {
    throw new Error('Output directory contains forbidden characters');
  }

  const normalizedInput = inputPath.replaceAll('\\', '/');

  if (normalizedInput.split('/').includes('..')) {
    throw new Error('Path traversal is not allowed in output directory');
  }

  return inputPath;
};

const safeJoin = (baseDir, targetName) => {
  const resolvedBaseDir = path.resolve(baseDir);
  const resolvedTargetPath = path.resolve(resolvedBaseDir, targetName);
  const normalizedBaseDir = resolvedBaseDir.endsWith(path.sep)
    ? resolvedBaseDir
    : `${resolvedBaseDir}${path.sep}`;

  if (resolvedTargetPath !== resolvedBaseDir && !resolvedTargetPath.startsWith(normalizedBaseDir)) {
    throw new Error(`Unsafe path: ${resolvedTargetPath}`);
  }

  return resolvedTargetPath;
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

const loadResource = async (resourceUrl, resourcePath) => {
  const validatedResourceUrl = validateUrl(resourceUrl).toString();

  log('downloading resource: %s -> %s', validatedResourceUrl, resourcePath);

  try {
    const response = await axios.get(validatedResourceUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 0,
      timeout: 10000,
    });
    await fs.writeFile(resourcePath, response.data);
    log('resource saved: %s', resourcePath);
  } catch (error) {
    throw wrapError(`Failed to load resource ${validatedResourceUrl}`, error);
  }
};

const createResourceTasks = (resources, pageUrl, resourcesDirpath, resourcesDirname, $) => {
  const uniqueResources = [...new Map(
    resources.map((resource) => [resource.absoluteUrl, resource]),
  ).values()];

  return uniqueResources.map(({ absoluteUrl }) => {
    const filename = path.basename(getResourceFilename(pageUrl, absoluteUrl));
    const filepath = safeJoin(resourcesDirpath, filename);

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

const pageLoader = async (url, outputDir = process.cwd()) => {
  const parsedPageUrl = validateUrl(url);
  const pageUrl = parsedPageUrl.toString();
  const safeOutputDirInput = validateOutputDirInput(outputDir);
  const normalizedOutputDir = path.resolve(safeOutputDirInput);

  await ensureOutputDirExists(normalizedOutputDir);

  const outputFilename = path.basename(getOutputPath('.', pageUrl));
  const resourcesDirname = path.basename(getResourcesDirname(pageUrl));
  const filePath = safeJoin(normalizedOutputDir, outputFilename);
  const resourcesDirpath = safeJoin(normalizedOutputDir, resourcesDirname);

  log('start loading page: %s', pageUrl);
  log('output html path: %s', filePath);
  log('resources dir path: %s', resourcesDirpath);

  let html;

  try {
    const response = await axios.get(pageUrl, {
      maxRedirects: 0,
      timeout: 10000,
    });
    html = response.data;
  } catch (error) {
    throw wrapError(`Failed to load page ${pageUrl}`, error);
  }

  const $ = load(html);

  const resources = resourceSelectors.flatMap(({ tag, attr }) => (
    $(`${tag}[${attr}]`).toArray().map((element) => {
      const value = $(element).attr(attr);

      if (!value) {
        return null;
      }

      const absoluteUrl = new URL(value, pageUrl).toString();

      return {
        element,
        attr,
        value,
        absoluteUrl,
      };
    })
  ))
    .filter(Boolean)
    .filter(({ value, absoluteUrl }) => {
      const isLocal = isLocalResource(pageUrl, value);

      if (isLocal) {
        log('local resource found: %s -> %s', value, absoluteUrl);
      } else {
        log('external resource skipped: %s -> %s', value, absoluteUrl);
      }

      return isLocal;
    });

  log('local resources count: %d', resources.length);

  try {
    await fs.mkdir(resourcesDirpath);
    log('resources dir created: %s', resourcesDirpath);
  } catch (error) {
    throw wrapError(`Failed to create directory ${resourcesDirpath}`, error);
  }

  const tasks = new Listr(
    [
      {
        title: 'Downloading resources',
        task: () => new Listr(
          createResourceTasks(resources, pageUrl, resourcesDirpath, resourcesDirname, $),
          { concurrent: true },
        ),
      },
    ],
    {
      renderer: process.stdout.isTTY ? 'default' : 'silent',
    },
  );

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
