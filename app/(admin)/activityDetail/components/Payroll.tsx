// import { useEffect, useState } from 'react';
// import { Button, Flex, Form, Input, Tag } from 'antd';
// import { PayCircleOutlined } from '@ant-design/icons';
// import { ModalForm, ProFormDigit, ProFormText, ProTable } from '@ant-design/pro-components';
// import { HttpClient } from '@/utils/http';
// import { useMessage, usePagingAndQuery } from '@/hooks';
// import { 
//   Gender, 
//   PayrollState, 
//   genderValueEnumMap, 
//   payrollStateValueEnumMap, 
//   workTagValueEnumMap,
// } from '@/constants';

// import type { IPayrollRecord } from '@/utils/http/api-types';
// import { useCountdown } from 'usehooks-ts';

// type FormData = { smsCode: string; money?: number; target?: PaymentTarget };

// type FilterForm = {
//   id: number;
//   sex: Gender;
//   name: string;
//   state: PayrollState;
//   purePhoneNumber: string;
// };

// type PaymentTarget = {
//   id: number;
//   name: string;
//   sex: Gender;
//   workId: number;
//   workName: string;
//   workMoney: number;
//   purePhoneNumber: string;
// } | null;

// interface IPaymentModalProps {
//   open: boolean;
//   activityId: number;
//   target: PaymentTarget;
//   onOpenChange: (open: boolean) => void;
//   reloadTable: () => Promise<void>;
// };

// const PaymentModal = ({ open, activityId, target, onOpenChange, reloadTable }: IPaymentModalProps) => {

//   const [isCodeSent, setIsCodeSent] = useState(false);
//   const message = useMessage();
//   const [count, { startCountdown, resetCountdown }] = useCountdown({ countStart: 60 });

//   const handleSendCode = async () => {
//     await HttpClient.sendPaymentVerifySmsCode();
//     setIsCodeSent(true);
//     startCountdown();
//     message.success({ content: '验证码发送成功' });
//   };

//   const handleDoPayment = async (form: FormData) => {
//     let doPayment: Promise<boolean>;
//     delete form.target;
//     if(target) {
//       const { id } = target;
//       doPayment = HttpClient.doPaymentToSingle({ 
//         id,
//         activityId,
//         money: form.money!,
//         smsCode: form.smsCode,
//       }).then(() => {message.success('打款成功')}).then(reloadTable).then(() => true);
//     } else {
//       delete form.money;
//       doPayment = HttpClient.doPaymentToAll({ activityId, ...form }).then(() => {message.success('打款成功')}).then(reloadTable).then(() => true);
//     }
//     return doPayment;
//   };

//   useEffect(() => {
//     if(count === 0) {
//       setIsCodeSent(false);
//       resetCountdown();
//     }
//   }, [count, resetCountdown]);

//   return (
//     <ModalForm<FormData>
//       width={360}
//       open={open}
//       title={target ? '单独打款' : '一键打款'}
//       modalProps={{ centered: true, destroyOnClose: true }}
//       onOpenChange={onOpenChange}
//       onFinish={handleDoPayment}
//     >
//       {
//         target
//           ? (
//             <>
//               <ProFormText 
//                 width="md"
//                 name="target"
//                 label="打款给"
//                 initialValue={`${target.name} - ${genderValueEnumMap.get(target.sex)!} - ${target.purePhoneNumber} - ${target.workName}`}
//                 readonly
//               />
//               <ProFormDigit
//                 name="money"
//                 label="金额"
//                 width={128}
//                 disabled={!target}
//                 initialValue={target.workMoney}
//                 rules={[{ required: true, message: '金额不能为空' }]}
//               />
//             </>
//           )
//           : (
//             <>
//               <ProFormText 
//                 width="md"
//                 name="target"
//                 label="打款给"
//                 initialValue="全体已完成志愿者"
//                 readonly
//               />
//               <ProFormDigit
//                 name="money"
//                 label="金额"
//                 width={128}
//                 disabled={!target}
//                 initialValue="各岗位默认金额"
//                 rules={[{ required: true, message: '金额不能为空' }]}
//               />
//             </>
//           )
//       }
//       <Form.Item
//         name="smsCode"
//         label="验证码"
//         tooltip="打款属于敏感操作，需要负责人手机验证码验证"
//         wrapperCol={{ span: 16 }}
//         rules={[{ required: true, message: '请输入验证码' }]}
//       >
//         <Input.Search placeholder="验证码" enterButton={
//           <Button type="primary" ghost disabled={isCodeSent} onClick={handleSendCode}>
//             { isCodeSent ? count : '获取验证码' }
//           </Button>
//         } />
//       </Form.Item>
//     </ModalForm>
//   );
// };

// export const Payroll = ({ id }: { id: number }) => {

//   const [modalOpen, setModalOpen] = useState(false);
//   const [paymentTarget, setPaymentTarget] = useState<PaymentTarget>(null);
//   const {
//     reload: reloadTable,
//     state: {
//       paginationConfig,
//       loading: [loading],
//       dataSource: [checkinRecordList],
//     },
//     handler: {
//       handleFilterQuery,
//       handleFilterReset,
//     }
//   } = usePagingAndQuery<IPayrollRecord, FilterForm>({
//     pagingRequest: form => HttpClient.getPagingPayrollRecords({ ...form, activityId: id }),
//     queryRequest: form => HttpClient.filterPayrollRecords({ ...form, activityId: id }),
//     filterFormTransform: (form) => ({
//       sex: form.sex ?? null,
//       name: form.name ?? null,
//       state: form.state ?? null,
//       purePhoneNumber: form.purePhoneNumber ?? null,
//       id: form.id ? parseInt(form.id as unknown as string) : null,
//     }),
//   });

//   const handleDoPaymentSingle = (record: IPayrollRecord) => {
//     const target: PaymentTarget = {
//       id: record.id,
//       name: record.name,
//       sex: record.sex,
//       workId: record.workVo.id,
//       workName: record.workVo.name,
//       workMoney: record.workVo.money,
//       purePhoneNumber: record.purePhoneNumber,
//     };
//     setPaymentTarget(target);
//     setModalOpen(true);
//   };

//   return (
//     <>
//       <ProTable<IPayrollRecord, FilterForm>
//         rowKey='id'
//         loading={loading}
//         dataSource={checkinRecordList}
//         pagination={paginationConfig}
//         form={{ variant: 'filled', ignoreRules: false }}
//         search={{ span: 5, defaultCollapsed: false }}
//         toolbar={{
//           actions: [
//             <Button
//               key="doPaymentBatch"
//               type="primary"
//               icon={<PayCircleOutlined />}
//               onClick={() => {setPaymentTarget(null), setModalOpen(true)}}
//             >
//               一键打款
//             </Button>
//           ]
//         }}
//         onReset={handleFilterReset}
//         onSubmit={handleFilterQuery}
//         columns={[
//           {
//             title: '编号',
//             key: 'id',
//             dataIndex: 'id',
//             valueType: 'text',
//             formItemProps: {
//               rules: [{
//                 validateTrigger: 'submit',
//                 validator: (_, value) => !value || /^(\d?)+$/.test(value) ? Promise.resolve() : Promise.reject(new Error('编号需为纯数字')),
//               }],
//             },
//           },
//           {
//             title: '姓名',
//             dataIndex: 'name',
//             valueType: 'text',
//           },
//           {
//             title: '性别',
//             dataIndex: 'sex',
//             valueType: 'select',
//             valueEnum: genderValueEnumMap,
//             renderText: (_, { sex }) => genderValueEnumMap.get(sex)!
//           },
//           {
//             title: '手机号',
//             dataIndex: 'purePhoneNumber',
//             valueType: 'text',
//           },
//           {
//             title: '岗位',
//             dataIndex: ['workVo', 'name'],
//             valueType: 'text',
//             hideInSearch: true,
//             renderText: (_, { workVo: { name, label } }) => label ? name : `${name}（${workTagValueEnumMap.get(label)!.text}）`
//           },
//           {
//             title: '应得酬金',
//             dataIndex: ['workVo', 'money'],
//             valueType: 'money',
//             hideInSearch: true,
//           },
//           {
//             title: '实际酬金',
//             dataIndex: 'paidMoney',
//             valueType: 'money',
//             hideInSearch: true,
//           },
//           {
//             title: '状态',
//             dataIndex: 'state',
//             valueType: 'select',
//             valueEnum: payrollStateValueEnumMap,
//             renderText: (_, { state }) => <Tag color={payrollStateValueEnumMap.get(state)?.status}>{payrollStateValueEnumMap.get(state)?.text}</Tag>
//           },
//           {
//             title: '打款时间',
//             dataIndex: 'paidTime',
//             valueType: 'dateTime',
//             hideInSearch: true,
//           },
//           {
//             title: '操作',
//             key: 'option',
//             valueType: 'option',
//             align: 'center',
//             width: 240,
//             renderText: (_, record) => (
//               record.state === PayrollState.unpaid
//                 ? <Button type="link" icon={<PayCircleOutlined />} onClick={() => handleDoPaymentSingle(record)}>打款</Button>
//                 : null
//             )
//           }
//         ]}
//       >
//       </ProTable>
//       <PaymentModal
//         open={modalOpen}
//         activityId={id}
//         target={paymentTarget}
//         onOpenChange={setModalOpen}
//         reloadTable={reloadTable}
//       />
//     </>
//   );
// };

// export default Payroll;