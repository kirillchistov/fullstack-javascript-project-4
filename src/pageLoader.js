// поток построен на .then(): загрузка, создание директории, запись файла и возврат пути. 
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { getOutputPath } from './utils.js';

const pageLoader = (url, outputDir = process.cwd()) => axios.get(url)
  .then((response) => {
    const filePath = getOutputPath(outputDir, url);

    return fs.mkdir(path.dirname(filePath), { recursive: true })
      .then(() => fs.writeFile(filePath, response.data))
      .then(() => filePath);
  });

export default pageLoader;

