import {promisify} from 'util';
import {join} from 'path';
import rsyncWrapper from 'rsyncwrapper';
import {RSyncHandlerOptions, RsyncOptions} from '../types/types';
import logger from '../utils/logger';

const asyncRSync: (arg0: RsyncOptions) => Promise<string> =
  promisify(rsyncWrapper);

export default class RSyncHandler {
  private source: string;
  private destination: string;
  private ssh: {
    enabled: boolean;
    port?: string;
    privateKey?: string;
    username?: string;
  };
  private defaultArgs: string[];
  private outputFolderName: string;
  constructor(
    options: RSyncHandlerOptions,
    public identifier: string,
    private rsync = asyncRSync
  ) {
    this.source = options.source;
    this.destination = options.destination;
    this.ssh = options.ssh;
    if (this.ssh.enabled) {
      this.source = `${this.ssh.username}@${options.source}`;
    }
    this.defaultArgs = options.defaultArgs;
    this.outputFolderName = `${options.source
      .split('/')
      .filter(x => x)
      .pop()}`;
  }

  async sync(reverse = false) {
    logger.debug(`Syncing ${this.identifier}...`);
    const args = {
      src: reverse
        ? join(this.destination, this.outputFolderName)
        : this.source,
      dest: reverse
        ? this.source.replace(this.outputFolderName, '')
        : this.destination,
      recursive: true,
      deleteAll: true,
      args: this.defaultArgs,
      ssh: this.ssh.enabled,
      port: `${this.ssh.port || 22}`,
      privateKey: this.ssh.privateKey,
    };
    logger.debug(`Config: ${JSON.stringify(args, null, 2)}`);
    return this.rsync(args);
  }

  async customSync(options: RsyncOptions) {
    return this.rsync(options);
  }
}
