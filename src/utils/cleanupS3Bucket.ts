import S3Handler from '../handlers/S3';
import logger from './logger';

export default async function cleanupS3Bucket(
  sourceFiles: string[],
  s3Handle: S3Handler
) {
  logger.debug('[Cleanup]', `Cleaning up target ${s3Handle.identifier}...`);
  const {Contents} = await s3Handle.listObjects(false);
  logger.debug('[Cleanup]', `Found ${Contents?.length} files on target`);
  if (Contents) {
    for (const object of Contents) {
      if (object.Key && s3Handle.whitelist.includes(object.Key)) {
        logger.info('[Cleanup]', `Skipping ${object.Key} as it is whitelisted`);
      } else if (object.Key && !sourceFiles.includes(object.Key)) {
        logger.debug('[Cleanup]', `Deleting ${object.Key}...`);
        await s3Handle.deleteObject(object.Key);
      }
    }
  }
}
