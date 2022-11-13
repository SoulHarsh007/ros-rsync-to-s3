import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  _Object,
} from '@aws-sdk/client-s3';
import {readdir, readFile} from 'fs/promises';
import {join} from 'path';

export default class S3Handler {
  constructor(
    private s3Client: S3Client,
    private bucket: string,
    private prefix: string,
    public identifier: string,
    public whitelist: string[]
  ) {}

  async listObjects(includePrefix = true) {
    let IsTruncated = true;
    let ContinuationToken: string | undefined;
    let Contents: _Object[] = [];
    while (IsTruncated) {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: this.prefix,
          ContinuationToken,
        })
      );
      IsTruncated = response.IsTruncated || false;
      ContinuationToken = response.NextContinuationToken;
      Contents = Contents.concat(response.Contents || []);
    }
    return includePrefix
      ? {Contents}
      : {
          Contents:
            Contents?.map(object => ({
              ...object,
              Key: object.Key?.replace(this.prefix, ''),
            })) ?? [],
        };
  }

  async pushObject(
    key: string,
    body: string | Buffer | ReadableStream | Blob | Uint8Array,
    withPrefix = true
  ) {
    const response = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: withPrefix ? `${this.prefix}${key}` : key,
        Body: body,
      })
    );
    return response;
  }

  async pullObject(key: string) {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: `${this.prefix}${key}`,
      })
    );
    return response;
  }

  async deleteObject(key: string) {
    const response = await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: `${this.prefix}${key}`,
      })
    );
    return response;
  }

  async pushPackages(source: string) {
    const files = await readdir(source);
    for await (const file of files) {
      const body = await readFile(join(source, file), {encoding: 'utf8'});
      await this.pushObject(file, body, true);
    }
  }
}
