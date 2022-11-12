import {readdir} from 'fs/promises';
import {join} from 'path';

export default async function readDirRecursive(
  path: string,
  trimPath: string
): Promise<string[]> {
  const files: string[] = [];
  for await (const dirEntry of await readdir(path, {withFileTypes: true})) {
    const entryPath = join(path, dirEntry.name);
    if (dirEntry.isDirectory()) {
      files.push(...(await readDirRecursive(entryPath, trimPath)));
    } else if (dirEntry.isFile()) {
      files.push(entryPath.replace(trimPath, ''));
    }
  }
  return files;
}
