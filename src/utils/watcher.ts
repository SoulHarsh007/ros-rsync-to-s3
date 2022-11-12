import {FSWatcher, watch} from 'chokidar';
import {resolve} from 'path';
import logger from './logger';

export default function watcherConfig(
  path: string,
  onChange: (path: string) => void
): FSWatcher {
  const watcher = watch(resolve(path), {
    ignored: /(^|[/\\])\../,
    persistent: true,
    depth: 7,
    ignoreInitial: true,
    cwd: resolve(path),
    awaitWriteFinish: {
      stabilityThreshold: 2000,
    },
  }).on('all', (event, path) => {
    logger.debug(`Watcher: ${event} ${path}`);
    onChange(path);
  });
  return watcher;
}
