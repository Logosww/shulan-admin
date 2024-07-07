type COSBucketConfig = {
  bucketName: string;
  bucketRegion: string;
};

export enum BucketType {
  private = 'private',
  public = 'public',
};

export const bucketConfigMap: Record<BucketType, COSBucketConfig> = {
  [BucketType.private]: {
    bucketName: 'shulan-1323578300',
    bucketRegion: 'ap-shanghai',
  },
  [BucketType.public]: {
    bucketName: 'common-editor-1323578300',
    bucketRegion: 'ap-shanghai',
  },
};

export const COSPrivateBucketBaseUrl = 'https://shulan-1323578300.cos.ap-shanghai.myqcloud.com';
export const COSPublicBucketBaseUrl = 'https://common-editor-1323578300.cos.ap-shanghai.myqcloud.com';