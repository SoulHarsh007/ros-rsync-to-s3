import chalk from 'chalk';

export default {
  log: (...args: unknown[]) => console.log(...args),
  info: (...args: unknown[]) =>
    console.log(chalk.blueBright('[INFO]', ...args)),
  success: (...args: unknown[]) => console.log(chalk.greenBright(...args)),
  warn: (...args: unknown[]) =>
    console.log(chalk.yellowBright('[WARN]', ...args)),
  error: (...args: unknown[]) =>
    console.log(chalk.redBright('[ERROR]', ...args)),
  debug: (...args: unknown[]) =>
    process.env['DEBUG'] && console.log(chalk.gray('[DEBUG]', ...args)),
};
