import { 
  VolunteerSignUpState,
  volunteerSignUpStateValueEnum as _volunteerSignUpStateValueEnum,
} from '@/constants';
import { useCOS, useMessage } from '@/hooks';
import { HttpClient } from '@/utils/http';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormUploadDragger } from '@ant-design/pro-components';
import { Button, Form, Space } from 'antd';
import { nanoid } from 'nanoid';

import type { UploadFile } from 'antd';

type FormType = { key: string; activityWorkVolunteerState: VolunteerSignUpState };

const signUpStateExclude: VolunteerSignUpState[] = [
  VolunteerSignUpState.awaitingAudit,
  VolunteerSignUpState.cancelled,
  VolunteerSignUpState.cancelledOutOfIllegal,
];

const volunteerSignUpStateValueEnum = new Map<VolunteerSignUpState, string>();
_volunteerSignUpStateValueEnum.forEach((label, state) => (!signUpStateExclude.includes(state)) && volunteerSignUpStateValueEnum.set(state, label));

export const BatchImportModal = ({ id, onSubmit }:{ id: number; onSubmit: () => void }) => {
  
  const message = useMessage();
  const { upload } = useCOS();
  const [form] = Form.useForm();

  const handleSubmit = async (form: FormType) => {
    await HttpClient.batchImportAndAuditVolunteerSignUpState(form);
    message.success('更改成功');
    onSubmit();
    return true;
  };

  return (
    <ModalForm<FormType>
      title="批量导入"
      variant="filled"
      width={480}
      form={form}
      trigger={<Button icon={<UploadOutlined />}>批量导入</Button>}
      modalProps={{ 
        centered: true,
        afterClose: form.resetFields,
      }}
      onFinish={handleSubmit}
    >
      <ProFormSelect name="activityWorkVolunteerState" label="报名状态" width="xs" valueEnum={volunteerSignUpStateValueEnum} rules={[{ required: true, message: '报名状态不能为空' }]} />
      <ProFormUploadDragger
        name="key"
        max={1}
        transform={(file: UploadFile[]) => file[0].response}
        rules={[{ required: true, message: '请上传名单' }]}
        label={
          <Space size={4}>
            填写完模板后，上传一键导入。
            <a href="//common-1323578300.cos.ap-shanghai.myqcloud.com/shulan-manage/change_activity_work_volunteer_state_list.xlsx"><DownloadOutlined />下载模板</a>
          </Space>
        }
        fieldProps={{
          customRequest: async ({ onProgress, onSuccess, file }) => {
            const key = await upload(file as File, `excel/${nanoid()}.xlsx`, e => onProgress?.(e));
            onSuccess?.(key);
          }
        }}
      />
    </ModalForm>
  )
};