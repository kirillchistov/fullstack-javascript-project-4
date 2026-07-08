// поток построен на .then(): загрузка, создание директории, запись файла и возврат пути. 
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

const loadResource = (resourceUrl, resourcePath) => axios.get(resourceUrl, { responseType: 'arraybuffer' })
  .then((response) => fs.writeFile(resourcePath, response.data));

const pageLoader = (url, outputDir = process.cwd()) => axios.get(url)
  .then((response) => {
    const html = response.data;
    const filePath = getOutputPath(outputDir, url);
    const resourcesDirname = getResourcesDirname(url);
    const resourcesDirpath = path.join(outputDir, resourcesDirname);
    const $ = load(html);

    const images = $('img').toArray()
      .map((element) => $(element))
      .map(($img) => $img.attr('src'))
      .filter(Boolean)
      .filter((src) => isLocalResource(url, src));

    const uniqueImages = [...new Set(images)];

    return fs.mkdir(resourcesDirpath, { recursive: true })
      .then(() => Promise.all(uniqueImages.map((src) => {
        const absoluteUrl = new URL(src, url).toString();
        const filename = getResourceFilename(url, absoluteUrl);
        const filepath = path.join(resourcesDirpath, filename);

        return loadResource(absoluteUrl, filepath)
          .then(() => {
            $('img').each((_, img) => {
              const currentSrc = $(img).attr('src');

              if (currentSrc === src) {
                $(img).attr('src', path.posix.join(resourcesDirname, filename));
              }
            });
          });
      })))
      .then(() => fs.writeFile(filePath, $.html()))
      .then(() => filePath);
  });

export default pageLoader;
