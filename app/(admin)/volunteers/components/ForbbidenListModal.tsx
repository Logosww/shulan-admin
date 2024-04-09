import { useState } from 'react';
import { Button, Form, Input, Typography } from 'antd';
import { HttpClient } from '@/utils/http';
import { useMessage, useModal } from '@/hooks';
import { VolunteerWhitelistState } from '@/constants/value-enum';
import { ModalForm, ProFormDigit, ProFormGroup, ProList } from '@ant-design/pro-components';

import type{ IVolunteer } from '@/utils/http/api-types';

export const ForbbidenListModal = ({ reloadTable }: { reloadTable: () => Promise<any> }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [volunteerList, setVolunteerList] = useState<IVolunteer[]>([]);

  const message = useMessage();
  const modal = useModal();
  const [form] = Form.useForm();

  const getForbbidenList = async () => {
    const list = await HttpClient.filterVolunteers({
      name: null,
      identity: null,
      purePhoneNumber: null,
      state: VolunteerWhitelistState.forbidden,
    });
    setVolunteerList(list);
  };

  const handleSearch = async () => {
    await form.validateFields();
    const phones = form.getFieldValue('phones') as string;
    if(!phones) return;

    setIsLoading(true);
    const purePhoneNumbers = phones.split(' ').filter(val => val);
    const { result, notFound } = await HttpClient.searchVolunteers({ purePhoneNumbers }).finally(() => setIsLoading(false));
    if(!result.length) return message.error('未找到符合条件的志愿者');
    const list = result.filter(({ id }) => volunteerList.findIndex(({ id: _id }) => _id === id) < 0);
    if(!list.length) return message.warning('请勿重复添加');

    const ids = list.map(({ id }) => id);
    const releaseAt = form.getFieldValue('releaseAt');
    await HttpClient.batchForbidVolunteer({ ids, releaseAt });
    setVolunteerList([...volunteerList, ...list]);
    message.success('添加成功');
    if(notFound.length) modal.error({
      footer: null,
      centered: true,
      closable: true,
      title: '未找到以下手机号',
      content: notFound.map((phone, index) => <div key={index}>{phone}</div>),
    });
    reloadTable();
  };

  return (
    <ModalForm
      title="封禁管理"
      variant="filled"
      width={480}
      form={form}
      submitter={false}
      modalProps={{ centered: true, destroyOnClose: true }}
      trigger={<Button ghost danger>封禁管理</Button>}
      onOpenChange={open => open ? getForbbidenList() : setVolunteerList([])}
    >
      <ProFormGroup> 
        <ProFormDigit label="封禁时间" name="releaseAt" width="xs" placeholder="单位：月" min={1} rules={[{ required: true }]} />
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
            render: (_, { purePhoneNumber: phone }) => <Typography.Text>手机号：{phone}</Typography.Text>
          },
        }}
      />
    </ModalForm>
  );
};