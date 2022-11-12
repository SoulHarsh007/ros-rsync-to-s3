import {join} from 'path';
import RSyncHandler from '../handlers/RSync';
import {Config} from '../types/types';

export default function initRsyncClient(config: Config): RSyncHandler {
  const {source} = config;
  return new RSyncHandler(
    {
      defaultArgs: ['-a'],
      ssh: source.ssh,
      source: source.endpoint,
      destination: join(config.cloneDir, source.identifier),
    },
    source.identifier
  );
}
