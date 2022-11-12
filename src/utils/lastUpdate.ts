import ms from 'ms';
import S3Handler from '../handlers/S3';
import logger from './logger';

export default async function lastUpdate(
  lastUpdateTS: number,
  target: S3Handler
) {
  logger.debug(`Last update timestamp: ${lastUpdateTS}`);
  logger.debug('[LastUpdate]', `Checking target ${target.identifier}...`);
  const lastUpdate = new Date(lastUpdateTS);
  try {
    const {Body} = await target.pullObject('lastupdate');
    if (Body) {
      const lastUpdateTarget = new Date(
        parseInt(await Body.transformToString(), 10) * 1000
      );
      logger.debug(
        '[LastUpdate]',
        `Last update on ${target.identifier} was at: ${lastUpdateTarget}`
      );
      if (lastUpdateTarget > lastUpdate) {
        logger.warn(
          '[LastUpdate]',
          `Last update on ${target.identifier} is newer (${ms(
            lastUpdateTarget.getTime() - lastUpdate.getTime()
          )})!`
        );
        return true;
      } else if (lastUpdateTarget.getTime() - lastUpdate.getTime() === 0) {
        logger.success(
          '[LastUpdate]',
          `Last update on ${target.identifier} is in sync!`
        );
        return true;
      }
    }
  } catch (error) {
    logger.error(
      '[LastUpdate]',
      `Error while pulling lastupdate information from target: ${target}`,
      error
    );
  }
  return false;
}
