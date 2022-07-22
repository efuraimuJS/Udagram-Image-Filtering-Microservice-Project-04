import * as AWS  from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('bucketAccess');

export class BucketAccess {
  constructor(
    private s3 = new XAWS.S3({
        signatureVersion: 'v4'
      }),
    private todosImagesBucketName = process.env.TODOS_S3_BUCKET,
    private signedUrlExpireSeconds = process.env.SIGNED_URL_EXPIRATION){
  }

    // Generates an AWS signed URL for uploading objects
    getPutSignedUrl( key: string ) {
        const presignedUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.todosImagesBucketName,
            Key: key,
            Expires: parseInt(this.signedUrlExpireSeconds),
        }, function(err, url) {
          if (err) {
            logger.info('getPutSignedUrl, error on getting put url', {error: err});
          } else {
            logger.info('getPutSignedUrl, a put url is generated', {presignedUrl: presignedUrl});
          }
        });

        return presignedUrl;
    }

  getImageUrl(imageId){
      const url = `https://${this.todosImagesBucketName}.s3.amazonaws.com/${imageId}`;
      logger.info('getImageUrl', {imageUrl: url});

      return url;
  }
}