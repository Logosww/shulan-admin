import COS from 'cos-js-sdk-v5';

import { nanoid } from 'nanoid';
import { COSBucketBaseUrl } from '@/constants';
import { isClient } from '@/utils/http/request';
import { getCOSBucketCredentials } from '@/utils/http/api';

import type { ProgressInfo } from 'cos-js-sdk-v5';

const config = {
  bucketName: 'shulan-1323578300',
  bucketRegion: 'ap-shanghai'
};

let cos: COS;

export const useCOSUpload = (
  onProgress?: (params: ProgressInfo) => void,
  returnUrl?: boolean
) => {
  if(!isClient) return { upload: () => Promise.resolve('') };

  let globalOnProgress = onProgress;

  if(!cos) cos = new COS({
    async getAuthorization(_options, callback) {
      const data = await getCOSBucketCredentials();
      const { credentials } = data;
      callback({
        TmpSecretId: credentials.tmpSecretId,
        TmpSecretKey: credentials.tmpSecretKey,
        SecurityToken: credentials.sessionToken,
        StartTime: data.startTime,
        ExpiredTime: data.expiredTime
      });
      },
    }
  );

  const upload = (file: File, path?: string, onProgress?: (params: ProgressInfo) => void) => {
    if(!cos) return Promise.reject('COS 实例初始化失败');

    const extension = file.name.split('.').at(-1);
    const generateKey = () => {
      const { type } = file;
      return `${ type.startsWith('image') ? 'image' : 'temp' }/${nanoid()}.${extension}`
    };
    return new Promise<string>(async (resolve, reject) => {
      try {
        const key = path ?? generateKey();
        await cos.uploadFile(
          {
            Bucket: config.bucketName,
            Region: config.bucketRegion,
            Key: key,
            Body: file,
            onProgress: onProgress ?? globalOnProgress
          }
        );
        resolve(returnUrl ? `${COSBucketBaseUrl}/${key}` : key);
      } catch(err) {
        reject(err);
      }
    });
  };

  return { upload };
};