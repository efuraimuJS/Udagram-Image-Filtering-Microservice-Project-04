import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

export class FileStoreAccess {
    /**
     * Constructs a FileStoreAccess instance.
     * @param s3Client The S3 file store client.
     * @param s3Bucket The S3 bucket name.
     * @param signedUrlExp The S3 bucket pre-signed URL expiration time
     * in seconds.
     */
    constructor(
        private readonly s3Client = FileStoreAccess.createS3Client(),
        private readonly s3Bucket = process.env.IMAGES_S3_BUCKET,
        private readonly signedUrlExp = process.env.S3_SIGNED_URL_EXP
    ) {}

    /**
     * Return the live or offline S3 client depending on serverless
     * running mode.
     * @returns The S3 client.
     */
    private static createS3Client() {
        // Encapsulate AWS SDK to use AWS X-Ray
        const XAWS = AWSXRay.captureAWS(AWS);

        // Serverless running in offline mode
        if (process.env.IS_OFFLINE) {
            return new XAWS.S3({
                s3ForcePathStyle: true,
                accessKeyId: 'S3RVER',
                secretAccessKey: 'S3RVER',
                endpoint: new XAWS.Endpoint('http://localhost:6000'),
            });
        } else {
            // Running in live mode
            return new XAWS.S3({ signatureVersion: 'v4' });
        }
    }

    /**
     * Gets the S3 file store http address.
     * @returns The S3 file store http address.
     */
    getFileStoreAddress() {
        return `https://${this.s3Bucket}.s3.amazonaws.com`;
    }

    /**
     * Generates a pre-signed URL allowing a new object upload to S3
     * file store.
     * @param objectKey The key name of the object to be uploaded.
     * @returns The pre-signed URL allowing the PUT object operation to
     * S3 file store.
     */
    genPutPreSignedUrl(objectKey: string) {
        return this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3Bucket,
            Key: objectKey,
            Expires: +this.signedUrlExp,
        });
    }
}
