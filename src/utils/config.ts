import {parse, stringify} from 'yaml';
import {join} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import {homedir, userInfo} from 'os';
import logger from './logger';
import {Config} from '../types/types';
import ms from 'ms';

let config: Partial<Config> = {
  maxConcurrency: false,
  pollInterval: 3600000,
  cloneDir: join(process.cwd(), 'rsync-clone-dir'),
  pushTo: [],
  _state: true,
};

export default function getConfig(): Config {
  if (config._state) {
    const configPath = join(process.cwd(), 'ros.config.yml');
    let file = '';
    try {
      file = readFileSync(configPath, 'utf8');
    } catch (e) {
      logger.error(
        'Error while reading the configuration file:',
        (e as Error).message
      );
      const path = join(process.cwd(), 'ros.config.yml');
      logger.info('Attempting to create example configuration file at:', path);
      try {
        writeFileSync(
          path,
          stringify(
            {
              ...config,
              pushTo: [
                {
                  identifier: 'INSTANCE.S3.EXAMPLE.DEVEL@RX800',
                  endpoint: 'https://s3.soulharsh007.rocks/',
                  credentials: {
                    accessKeyId: 'EXAMPLE',
                    secretAccessKey: 'EXAMPLE',
                  },
                  bucket: 'EXAMPLE',
                  region: 'EXAMPLE',
                  type: 'S3',
                  path: 'RebornOS/',
                },
              ],
              source: {
                identifier: 'INSTANCE.RSYNC.EXAMPLE.DEVEL@RX800',
                endpoint: 'rsync.soulharsh007.rocks:/srv/rebornos/RebornOS/',
                ssh: {
                  enabled: true,
                  port: '22',
                  privateKey: join(homedir(), '.ssh', 'id_rsa.EXAMPLE'),
                  username: userInfo().username,
                },
                type: 'RSYNC',
              },
              _state: undefined,
            },
            {indent: 2}
          )
        );
        logger.info('Example configuration file created successfully');
      } catch (e) {
        logger.error(
          'Error while creating default configuration file:',
          (e as Error).message
        );
      }
      logger.error(
        'Please update the example configuration file and try again'
      );
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
    config = {...config, ...parse(file), _state: undefined};
    config.pollInterval = ms(`${config.pollInterval}`) || 3600000;
  }
  return config as Config;
}
