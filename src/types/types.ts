export interface Config {
  cloneDir: string;
  maxConcurrency: boolean;
  pollInterval: number;
  pushTo: S3Instance[];
  source: RSyncInstance;
  _state: boolean | undefined;
}

export interface S3Instance {
  identifier: string;
  endpoint: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region: string;
  bucket: string;
  path?: string;
  whitelist?: string[];
}

export interface RSyncInstance {
  identifier: string;
  endpoint: string;
  ssh: {
    enabled: boolean;
    port?: string;
    privateKey?: string;
    username?: string;
  };
}

export interface RsyncOptions {
  src: string | Array<string>;
  dest: string;
  ssh?: boolean;
  port?: string;
  privateKey?: string;
  sshCmdArgs?: Array<string>;
  recursive?: boolean;
  deleteAll?: boolean;
  delete?: boolean;
  compareMode?: 'checksum' | 'sizeOnly';
  include?: Array<string>;
  exclude?: Array<string>;
  excludeFirst?: Array<string>;
  dryRun?: boolean;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  times?: boolean;
  args?: Array<string>;
}

export interface RSyncHandlerOptions {
  source: string;
  destination: string;
  ssh: {
    enabled: boolean;
    port?: string;
    privateKey?: string;
    username?: string;
  };
  defaultArgs: string[];
}
