'use client';

import { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { HttpClient } from '@/utils';
import { useMessage, useModal } from '@/hooks';
import { ModalForm, ProFormDigit, ProFormGroup, ProFormSegmented, ProFormText, ProList } from '@ant-design/pro-components';
import { PlusOutlined} from '@ant-design/icons';
import { volunteerTypeForFormValueEnumMap } from '@/constants';
import Text from 'antd/es/typography/Text';

import type {
  IVolunteer,
  TemporaryVolunteerForm as _TemporaryVolunteerForm,
  SignUpRecordDetail as _SignUpRecordDetail,
} from '@/utils/http/api-types';

type TemporaryVolunteerForm = Omit<_TemporaryVolunteerForm, 'id' | 'volunteerIds'>;

export const TempVolunteerModal = ({ id, onSubmit }:{ id: number; onSubmit: () => void }) => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [volunteerList, setVolunteerList] = useState<IVolunteer[]>([]);

  const message = useMessage();
  const modal = useModal();
  const [form] = Form.useForm();


  const handleSearch = async () => {
    const phones = form.getFieldValue('phones') as string;
    if(!phones) return;

    setIsLoading(true);
    const purePhoneNumbers = phones.split(' ').filter(val => val);
    const { result, notFound } = await HttpClient.searchAvailableVolunteers({ activityId: id, purePhoneNumbers }).finally(() => setIsLoading(false));
    if(!result.length) return message.error('未找到符合条件的志愿者');
    const list = result.filter(({ id }) => volunteerList.findIndex(({ id: _id }) => _id === id) < 0);
    if(!list.length) return message.warning('请勿重复添加');

    setVolunteerList([...volunteerList, ...list]);
    if(notFound.length) modal.error({
      footer: null,
      centered: true,
      closable: true,
      title: '未找到以下手机号',
      content: notFound.map((phone, index) => <div key={index}>{phone}</div>),
    });
  };

  const handleSubmit = async (form: TemporaryVolunteerForm) => {
    const volunteerIds = volunteerList.map(({ id }) => id);
    await HttpClient.batchSetTempVolunteers({ id, volunteerIds, ...form });
    onSubmit();
    return true;
  };

  return (
    <ModalForm<TemporaryVolunteerForm>
      title="临时拉人"
      variant="filled"
      width={680}
      form={form}
      modalProps={{ centered: true, destroyOnClose: true }}
      submitter={{ submitButtonProps: { disabled: !volunteerList.length } }}
      trigger={<Button type="dashed" icon={<PlusOutlined />}>临时拉人</Button>}
      onFinish={handleSubmit}
      onOpenChange={open => !open && setVolunteerList([])}
    >
      <ProFormGroup> 
        <ProFormSegmented label="身份" name="activityWorkVolunteerIdentity" initialValue={1} valueEnum={volunteerTypeForFormValueEnumMap} rules={[{ required: true }]} />
        <ProFormDigit label="酬金" name="money" width="xs" max={500} rules={[{ required: true }]} />
        <ProFormDigit label="积分" name="integral" width="xs" max={1000} rules={[{ required: true }]} />
        <ProFormText label="备注" name="remark" width="xs" initialValue="" />
      </ProFormGroup>
      <Form.Item name="phones">
        <Input.Search placeholder="请输入手机号，并以空格分隔" enterButton="批量导入" onSearch={handleSearch} />
      </Form.Item>
      <ProList<IVolunteer>
        rowKey="id"
        loading={isLoading}
        dataSource={volunteerList}
        pagination={{ pageSize: 6, total: volunteerList.length }}
        metas={{
          title: {
            dataIndex: 'name'
          },
          subTitle: {
            render: (_, { purePhoneNumber: phone }) => <Text>手机号：{phone}</Text>
          },
          actions: {
            render: (_, { id }) => [
              <Button 
                type="text"
                size="small"
                key={id}
                onClick={() => setVolunteerList(_list => {
                  const list = [..._list];
                  const index = list.findIndex(({ id: _id }) => _id === id);
                  list.splice(index, 1);
                  return list;
                })}
                danger
              >
                删除
              </Button>
            ]
          }
        }}
      />
    </ModalForm>
  )
};