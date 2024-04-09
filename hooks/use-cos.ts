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

export const useCOS = (
  onProgress?: (params: ProgressInfo) => void,
  returnUrl?: boolean,
) => {
  if(!isClient) return { upload: () => Promise.resolve(''), download: () => Promise.resolve() };

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

  const download = (key: string, filename?: string) => new Promise<void>((resolve, reject) => {
    if(!cos) return reject('COS 实例初始化失败');

    cos.getObjectUrl({
      Bucket: config.bucketName,
      Region: config.bucketRegion,
      Key: key,
      Sign: true,
    }, (err, { Url }) => {
      if(err) return reject();

      const url = new URL(Url);
      url.searchParams.append('response-content-disposition', filename ? `attachment; filename=${encodeURIComponent(filename)}` : 'attachment');
      const a = document.createElement('a');
      a.href = url.toString();
      a.target = '_self';
      a.click();
      resolve();
    });
  });

  return { upload, download };
};