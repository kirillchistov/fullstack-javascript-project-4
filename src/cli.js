import { program } from 'commander';
import process from 'process';
import pageLoader from './pageLoader.js';

program
  .name('page-loader')
  .description('Downloads a web page to a local file')
  .argument('<url>', 'page url')
  .option('-o, --output [dir]', 'output directory', process.cwd())
  .action((url, options) => {
    pageLoader(url, options.output)
      .then((filepath) => {
        console.log(filepath);
      })
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
  });

program.parse(process.argv);