import { useCOS, useMessage, useModal } from '@/hooks';
import { ProFormUploadButton } from '@ant-design/pro-components';

import type { UploadFile } from 'antd';

export interface ICoverUploaderProps {
  label: string;
  name: string;
  tooltip?: string;
  required?: boolean;
}

export const CoverUploader = ({ label, name, tooltip, required: _required }: ICoverUploaderProps) => {
  const required = _required ?? true;

  const modal = useModal();
  const message = useMessage();
  const { upload } = useCOS();

  const handlePreviewPic = (file: UploadFile) => {
    const { originFileObj, url } = file;
    if(!(originFileObj || url)) return;

    const src = url || URL.createObjectURL(originFileObj!);
    modal.info({
      centered: true,
      maskClosable: true,
      width: 'auto',
      modalRender: () => <img className="rounded-[6px] max-h-[70vh] overflow-hidden" src={src} />,
    });
  };

  return (
    <ProFormUploadButton 
      listType="picture-card"
      max={1}
      name={name}
      label={label}
      tooltip={tooltip}
      rules={required ? [{ required: true, message: `${label}不能为空` }]: void 0}
      convertValue={(value: string) => {
        if(!value || !value.length) return [] as UploadFile[];
        if(typeof value === 'string') return [{
          status: 'done',
          url: value,
        }] as UploadFile[];
        return value;
      }}
      transform={(file: UploadFile[] | string) => Array.isArray(file) ? file[0].response : file}
      fieldProps={{
        onPreview: handlePreviewPic,
        customRequest: async ({ onProgress, onSuccess, file }) => {
          const covertPath = await upload(file as File, void 0, e => onProgress?.(e));
          onSuccess?.(covertPath);
          message.success('封面上传成功');
        }
      }}
    />
  )
};