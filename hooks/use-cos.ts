import COS from 'cos-js-sdk-v5';
import { nanoid } from 'nanoid';
import { isClient } from '@/utils/http/request';
import { bucketConfigMap, BucketType, COSPublicBucketBaseUrl } from '@/constants';
import { getCOSPrivateBucketCredentials, getCOSPublicBucketCredentials } from '@/utils/http/api';

import type { ProgressInfo } from 'cos-js-sdk-v5';

type UseCOSParams = {
  returnUrl?: boolean;
  isPublic?: boolean;
  onProgress?: (params: ProgressInfo) => void;
};

const COSClientMap: Record<BucketType, COS | null> = {
  [BucketType.private]: null,
  [BucketType.public]: null,
};

export const useCOS = (params?: UseCOSParams) => {
  if(!isClient) return { 
    download: Promise.resolve,
    getUrl: () => Promise.resolve(''),
    upload: () => Promise.resolve(''),
  };

  let cos: COS;
  let globalOnProgress = params?.onProgress;

  const clientIndex = params?.isPublic ? BucketType.public : BucketType.private;
  const bucketConfig = params?.isPublic ? bucketConfigMap[BucketType.public] : bucketConfigMap[BucketType.private];

  if(!COSClientMap[clientIndex]) cos = COSClientMap[clientIndex] = new COS({
    async getAuthorization(_options, callback) {
      const data = await (params?.isPublic ? getCOSPublicBucketCredentials() : getCOSPrivateBucketCredentials());
      const { credentials } = data;
      callback({
        TmpSecretId: credentials.tmpSecretId,
        TmpSecretKey: credentials.tmpSecretKey,
        SecurityToken: credentials.sessionToken,
        StartTime: data.startTime,
        ExpiredTime: data.expiredTime
      });
    },
  });
  else cos = COSClientMap[clientIndex];

  const getUrl = (key: string) => new Promise<string>((resolve, reject) => {
    if(!cos) return reject('COS 实例初始化失败');

    if(params?.isPublic) return resolve(`${COSPublicBucketBaseUrl}/${key}`);

    cos.getObjectUrl({
      Bucket: bucketConfig.bucketName,
      Region: bucketConfig.bucketRegion,
      Key: key,
      Sign: true,
    }, (err, { Url }) => err ? reject() : resolve(Url));
  });

  const upload = (file: File, path?: string, onProgress?: (params: ProgressInfo) => void) => {
    if(!cos) return Promise.reject('COS 实例初始化失败');

    const extension = file.name.split('.').at(-1);
    const generateKey = () => {
      const { type } = file;
      return `${type.startsWith('image') ? 'image' : 'temp' }/${nanoid()}.${extension}`
    };
    return new Promise<string>(async (resolve, reject) => {
      try {
        const key = path ?? generateKey();
        await cos!.uploadFile(
          {
            Bucket: bucketConfig.bucketName,
            Region: bucketConfig.bucketRegion,
            Key: key,
            Body: file,
            onProgress: onProgress ?? globalOnProgress
          }
        );
        resolve(params?.returnUrl ? (await getUrl(key)) : key);
      } catch(err) {
        reject(err);
      }
    });
  };

  const download = (key: string, filename?: string) => getUrl(key).then(_url => {
    const url = new URL(_url);
    url.searchParams.append('response-content-disposition', filename ? `attachment; filename=${encodeURIComponent(filename)}` : 'attachment');
    const a = document.createElement('a');
    a.href = url.toString();
    a.target = '_self';
    a.click();
  });

  return { getUrl, upload, download };
};