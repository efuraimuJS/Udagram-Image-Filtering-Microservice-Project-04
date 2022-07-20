import 'source-map-support/register';
import { FileStoreAccess } from '../ports/AWS/S3/fileStoreAccess';

// The file store access port
const fileStoreAccess = new FileStoreAccess();

/**
 * The file store http address.
 */
export const fileStoreUrl = fileStoreAccess.getFileStoreAddress();

/**
 * Get a pre-signed URL allowing a new object upload to file store.
 * @param objectKey The key name of the object to be uploaded.
 * @returns The pre-signed URL allowing the PUT object operation to
 * file store.
 */
export function getPutPreSignedUrl(objectKey: string) {
    return fileStoreAccess.genPutPreSignedUrl(objectKey);
}
