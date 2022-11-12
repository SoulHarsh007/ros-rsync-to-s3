import {mkdirSync, writeFileSync, rmSync} from 'fs';
import {Config} from '../types/types';

export default function validateConfig(config: Config): {
  errors: string[];
} {
  const errors: string[] = [
    {
      value: () => typeof config.maxConcurrency !== 'boolean',
      msg: '',
    },
    {
      value: () => {
        try {
          mkdirSync(config.cloneDir, {recursive: true});
          writeFileSync(`${config.cloneDir}/test`, 'test');
          rmSync(`${config.cloneDir}/test`);
        } catch (e) {
          return true;
        }
        return false;
      },
      msg: 'cloneDir is not writable by the current user',
    },
    {
      value: () => !Array.isArray(config.pushTo),
      msg: 'pushTo must be an array',
    },
  ]
    .filter(x => x.value())
    .map(x => x.msg);
  return {errors};
}
