// шаг 6: добавил асинхронность и обработку ошибок.
// console.error() пишет в stderr, а process.exitCode = 1 
// выставляет корректный код возврата без жёсткого немедленного завершения процесса.

import { program } from 'commander';
import process from 'process';
import pageLoader from './pageLoader.js';

program
  .name('page-loader')
  .description('Downloads a web page to a local file')
  .argument('<url>', 'page url')
  .option('-o, --output [dir]', 'output directory', process.cwd())
  .action(async (url, options) => {
    try {
      const filepath = await pageLoader(url, options.output);
      console.log(filepath);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
