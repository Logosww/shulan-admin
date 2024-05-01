'use client';

import { useState } from 'react';
import { Form, Input } from 'antd';
import { HttpClient } from '@/utils/http';
import { useMessage, useModal } from '@/hooks';
import { VolunteerWhitelistState } from '@/constants/value-enum';
import { ModalForm, ProList } from '@ant-design/pro-components';
import Text from 'antd/es/typography/Text';

import type { ReactNode } from 'react';
import type{ IVolunteer } from '@/utils/http/api-types';

export interface IBatchWhitelistStateModalProps<T = null> {
  title: string;
  trigger: JSX.Element;
  children: ReactNode;
  whitelistState: VolunteerWhitelistState,
  formTransform?: (form: Record<string, any>) => T;
  batchRequest: (params: { ids: number[]; form: T }) => Promise<any>;
  reloadTable: () => Promise<any>;
};

export const BatchWhitelistStateModal = <T extends Record<string, any>>(props: IBatchWhitelistStateModalProps<T>) => {
  const { title, trigger, children, whitelistState, formTransform, batchRequest, reloadTable } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [volunteerList, setVolunteerList] = useState<IVolunteer[]>([]);

  const message = useMessage();
  const modal = useModal();
  const [form] = Form.useForm();

  const getVolunteerList = async () => {
    const list = await HttpClient.filterVolunteers({
      name: null,
      identity: null,
      purePhoneNumber: null,
      state: whitelistState,
    });
    setVolunteerList(list);
  };

  const handleSearch = async () => {
    await form.validateFields();
    const phones = form.getFieldValue('phones') as string;
    if(!phones) return;

    setIsLoading(true);
    const purePhoneNumbers = phones.split(' ').filter(val => val);
    const { result: list, notFound } = await HttpClient.searchVolunteers({ purePhoneNumbers }).finally(() => setIsLoading(false));
    if(!list.length) return message.error('未找到符合条件的志愿者');

    const ids = list.map(({ id }) => id);
    await batchRequest({ ids, form: formTransform? formTransform(form.getFieldsValue()) : form.getFieldsValue() });
    setVolunteerList([...volunteerList, ...list]);
    message.success('导入成功');
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
      variant="filled"
      width={480}
      title={title}
      form={form}
      submitter={false}
      modalProps={{ centered: true, destroyOnClose: true }}
      trigger={trigger}
      onOpenChange={open => open ? getVolunteerList() : setVolunteerList([])}
    >
      {children}
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
        }}
      />
    </ModalForm>
  );
};

export default BatchWhitelistStateModal;