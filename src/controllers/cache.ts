import { S3 } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { Geofence } from './geofence';

export class Cache {
  public static s3 = new S3({
    credentials: {
      accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
      secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
    },
  });

  public static getCacheId(geofences: Geofence[]): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(geofences))
      .digest('hex')
      .substring(0, 16);
  }

  public static getCacheUrl(cacheId: string): string {
    return `${process.env.CDN_REGIONS_URL}/${cacheId}.json`;
  }

  public static async uploadCache(geofences: Geofence[]): Promise<string> {
    const cacheId = this.getCacheId(geofences);
    const url = this.getCacheUrl(cacheId);
    const exists = await this.isExists(cacheId);
    if (exists) return url;
    const body = JSON.stringify(geofences);
    await this.s3.putObject({
      Bucket: String(process.env.AWS_BUCKET),
      Key: `regions/${cacheId}.json`,
      ContentType: 'application/json',
      Body: body,
    });

    return url;
  }

  public static async isExists(cacheId: string): Promise<boolean> {
    try {
      await this.s3.headObject({
        Bucket: String(process.env.AWS_BUCKET),
        Key: `regions/${cacheId}.json`,
      });

      return true;
    } catch (err) {}
    return false;
  }
}
