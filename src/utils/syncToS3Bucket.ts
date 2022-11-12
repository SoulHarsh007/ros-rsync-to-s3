import {readFile} from 'fs/promises';
import {join} from 'path';
import S3Handler from '../handlers/S3';
import {Config} from '../types/types';
import logger from './logger';

export default async function syncToS3Bucket(
  sourceFiles: string[],
  s3Handle: S3Handler,
  config: Config
) {
  for (const file of sourceFiles) {
    logger.info('[Sync]', `Pushing ${file} to ${s3Handle.identifier}...`);
    const body = await readFile(
      join(config.cloneDir, config.source.identifier, file)
    );
    await s3Handle.pushObject(file, body);
  }
}
