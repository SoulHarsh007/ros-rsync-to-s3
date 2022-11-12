import getConfig from './utils/config';
import logger from './utils/logger';
import initRsyncClient from './utils/initRsyncClient';
import {initS3Clients} from './utils/initS3Clients';
import {existsSync, readFileSync} from 'fs';
import {join} from 'path';
import lastUpdate from './utils/lastUpdate';
import readDirRecursive from './utils/readDirRecursive';
import syncToS3Bucket from './utils/syncToS3Bucket';
import cleanupS3Bucket from './utils/cleanupS3Bucket';
import watcherConfig from './utils/watcher';
import validateConfig from './utils/configValidator';

logger.info('RebornOS Rsync to S3 Sync Service Started....');
const config = getConfig();
logger.success('Configuration loaded successfully');
logger.info('Validating configuration...');
const {errors} = validateConfig(config);
if (errors.length) {
  logger.error('Configuration validation failed');
  logger.error('Errors:');
  errors.forEach(x => logger.error(x));
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}
logger.success('Configuration validated successfully');
logger.info('Initializing Rsync Client...');
const rsyncHandle = initRsyncClient(config);
logger.success('Rsync Client initialized successfully');
logger.info('Initializing S3 Clients...');
const s3Clients = initS3Clients(config);
logger.success(`S3 Clients [${s3Clients.length}] initialized successfully`);
logger.info('Checking for updates...');
try {
  await rsyncHandle.sync();
} catch (error) {
  logger.error('Error while syncing:', (error as Error).message);
}
logger.info('Checking for last update...');
const sourcePath = join(config.cloneDir, config.source.identifier);
if (config.maxConcurrency) {
  logger.info('Maximizing concurrency...');
  logger.warn('This may cause memory issues');
}
const doNonConcurrentPush = async () => {
  const hasLastUpdate = existsSync(join(sourcePath, 'lastupdate'));
  if (!hasLastUpdate) {
    return;
  }
  const lastUpdateTS =
    parseInt(readFileSync(join(sourcePath, 'lastupdate'), 'utf8'), 10) * 1000;
  const content = await readDirRecursive(sourcePath, `${sourcePath}/`);
  for (const s3Client of s3Clients) {
    const s3Data = (await s3Client.listObjects(false)).Contents?.map(
      x => x.Key
    );
    const missingData = content.filter(x => !s3Data?.includes(x));
    if (missingData.length) {
      logger.warn(
        '[Sync]',
        `Missing data on ${s3Client.identifier}: ${missingData.join(', ')}`
      );
      logger.info(`Syncing missing content to ${s3Client.identifier}...`);
      await syncToS3Bucket(missingData, s3Client, config);
      logger.success(`Synced ${s3Client.identifier}`);
    }
    const result = await lastUpdate(lastUpdateTS, s3Client);
    if (result) {
      logger.info(`${s3Client.identifier} is upto date`);
    } else {
      logger.info(`Syncing ${s3Client.identifier}...`);
      await syncToS3Bucket(content, s3Client, config);
      logger.success(`Synced ${s3Client.identifier}`);
    }
    logger.info(`Cleaning up ${s3Client.identifier}...`);
    await cleanupS3Bucket(content, s3Client);
    logger.success(`Cleaned up ${s3Client.identifier}`);
  }
};
const doConcurrentPush = async () => {
  const hasLastUpdate = existsSync(join(sourcePath, 'lastupdate'));
  if (!hasLastUpdate) {
    return;
  }
  const lastUpdateTS =
    parseInt(readFileSync(join(sourcePath, 'lastupdate'), 'utf8'), 10) * 1000;
  const content = await readDirRecursive(sourcePath, `${sourcePath}/`);
  await Promise.all(
    s3Clients.map(async s3Client => {
      const s3Data = (await s3Client.listObjects(false)).Contents?.map(
        x => x.Key
      );
      const missingData = content.filter(x => !s3Data?.includes(x));
      if (missingData.length) {
        logger.warn(
          '[Sync]',
          `Missing data on ${s3Client.identifier}: ${missingData.join(', ')}`
        );
        logger.info(`Syncing missing content to ${s3Client.identifier}...`);
        await syncToS3Bucket(missingData, s3Client, config);
        logger.success(`Synced ${s3Client.identifier}`);
      }
      const result = await lastUpdate(lastUpdateTS, s3Client);
      if (result) {
        logger.info(`${s3Client.identifier} is upto date`);
      } else {
        logger.info(`Syncing ${s3Client.identifier}...`);
        await syncToS3Bucket(content, s3Client, config);
        logger.success(`Synced ${s3Client.identifier}`);
      }
      logger.info(`Cleaning up ${s3Client.identifier}...`);
      await cleanupS3Bucket(content, s3Client);
      logger.success(`Cleaned up ${s3Client.identifier}`);
    })
  );
};
const doPush = async () => {
  if (config.maxConcurrency) {
    await doConcurrentPush();
  } else {
    await doNonConcurrentPush();
  }
};
await doPush();
logger.info('Initial Sync Completed');
logger.info('Starting Watcher...');
watcherConfig(sourcePath, async () => {
  logger.info('Change detected, syncing...');
  await doPush();
  logger.info('Sync completed');
});
logger.success('Watcher Started');
setInterval(async () => {
  try {
    await rsyncHandle.sync();
  } catch (error) {
    logger.error('Error while syncing:', (error as Error).message);
  }
}, config.pollInterval);
