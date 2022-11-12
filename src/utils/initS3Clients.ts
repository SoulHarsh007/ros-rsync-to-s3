import {S3Client} from '@aws-sdk/client-s3';
import {Config} from '../types/types';
import S3Handler from '../handlers/S3';

const s3Clients: S3Handler[] = [];

export function initS3Clients(config: Config): S3Handler[] {
  const {pushTo} = config;
  for (const target of pushTo) {
    s3Clients.push(
      new S3Handler(
        new S3Client({
          region: target.region,
          credentials: {
            accessKeyId: target.credentials.accessKeyId,
            secretAccessKey: target.credentials.secretAccessKey,
          },
          forcePathStyle: true,
          endpoint: target.endpoint,
        }),
        target.bucket,
        target.path || '',
        target.identifier,
        target.whitelist || []
      )
    );
  }
  return s3Clients;
}

export default s3Clients;
