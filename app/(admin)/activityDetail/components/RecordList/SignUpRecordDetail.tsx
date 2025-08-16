'use client';

import { Popover, Space, Image, Button, Tag, Table } from 'antd';
import { HttpClient } from '@/utils';
import { idCardTypeValueEnumMap } from '@/constants/value-enum';
import { ProDescriptions } from '@ant-design/pro-components';
import { EyeOutlined } from '@ant-design/icons';

import type {
  SignUpRecordDetail as _SignUpRecordDetail,
  IVolunteerDetail,
} from '@/utils/http/api-types';

const { Summary } = Table;
const { Row, Cell } = Summary;

const signUpDetailItemStyle = { whiteSpace: 'pre-line', maxWidth: 500 };

export const SignUpRecordDetail = ({ id }: { id: number }) => (
  <ProDescriptions<_SignUpRecordDetail, { id: number }>
    column={3}
    params={{ id }}
    request={params => HttpClient.getSignUpRecordDetail(params as { id: number }).then(data => ({ data, success: true }))}
    columns={[
      {
        title: '身份',
        renderText: (_, { isStudentVerified, volunteerIdentityVo }) => (
          <>
            {
              volunteerIdentityVo.studentCardPicUrls.length
                ? (
                  <>
                    学生
                    {isStudentVerified && <Tag bordered={false} color="processing" className="ms-2">已认证</Tag>}
                  </>
                )
                : '社会人士'
            }
            <Popover
              trigger="click"
              title="身份详情"
              content={
                <ProDescriptions
                  column={2}
                  bordered={true}
                  dataSource={volunteerIdentityVo}
                  columns={
                    volunteerIdentityVo.studentCardPicUrls.length
                      ? [
                        {
                          title: '学校',
                          dataIndex: 'school',
                          valueType: 'text',
                        },
                        {
                          title: '专业',
                          dataIndex: 'major',
                          valueType: 'text',
                        },
                        {
                          title: '年级',
                          dataIndex: 'grade',
                          valueType: 'text',
                        },
                        {
                          title: '学生证',
                          renderText: () => (
                            <Space>
                              {volunteerIdentityVo.studentCardPicUrls.map((url, index) => <Image className="object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
                            </Space>
                          )
                        },
                      ]
                      : [
                        {
                          title: '毕业院校',
                          dataIndex: 'school',
                          valueType: 'text',
                        },
                        {
                          title: '入职单位',
                          dataIndex: 'jobUnit',
                          valueType: 'text',
                        },
                        {
                          title: '入职单位证明',
                          hide: volunteerIdentityVo.identityCertPicUrls.length === 0,
                          renderText: () => (
                            <Space>
                              {volunteerIdentityVo.identityCertPicUrls.map((url, index) => <Image className="object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
                            </Space>
                          )
                        },
                      ]
                  }
                />
              }
            >
              <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
            </Popover>
          </>
        )
      },
      {
        title: '户籍',
        dataIndex: 'householdRegister',
        renderText: (_, { householdRegister }) => householdRegister.join(''),
      },
      {
        title: '证件照',
        dataIndex: 'idPhotoUrl',
        renderText: (_, { idPhotoUrl }) => <Image className="rounded-[6px] object-cover" src={idPhotoUrl} width={90} height={120} />
      },
      {
        title: '证件类型',
        dataIndex: 'idCardType',
        valueEnum: idCardTypeValueEnumMap,
      },
      {
        title: '证件号码',
        dataIndex: 'idCard',
      },
      {
        title: '认证时间',
        dataIndex: 'identityAt',
        valueType: 'dateTime',
      },
      {
        title: '报名原因',
        dataIndex: 'reason',
        valueType: 'textarea',
        contentStyle: signUpDetailItemStyle,
      },
      {
        title: '证件扫描件',
        renderText: (_, { idCardNationalUrl, idCardPortraitUrl }) => (
          <Space>
            <Image className="object-cover" src={idCardNationalUrl} style={{ width: 96, height: 60, borderRadius: 6 }} />
            <Image className="object-cover" src={idCardPortraitUrl} style={{ width: 96, height: 60, borderRadius: 6 }} />
          </Space>
        ),
      },
      {
        title: '相关经历',
        dataIndex: 'experience',
        valueType: 'text',
        contentStyle: signUpDetailItemStyle,
      },
      {
        title: '相关经历证明',
        renderText: (_, { experiencePicUrls }) => (
          <Space>
            {experiencePicUrls.map((url, index) => <Image className="object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
          </Space>
        )
      },
      {
        title: '白名单情况',
        renderText: (_, { stateVo: { whiteListExpireAt } }) => whiteListExpireAt ? `${whiteListExpireAt} 到期` : '无',
      },
      {
        title: '违规情况',
        renderText: (_, { stateVo: { currentViolateCount, violateCount, violateAt, releaseAt } }) => (
          violateCount
            ? `当前违规：${currentViolateCount}次 | 累计违规：${violateCount}次 | 封禁时间：${violateAt} | 解禁时间: ${releaseAt}`
            : '无'
        )
      },
      {
        title: '历史志愿活动',
        dataIndex: 'activityWorkExperienceVos',
        valueType: 'textarea',
        render: (_, {
          totalActivityTransferAmount,
          activityWorkExperienceTotalNum,
          activityWorkExperienceVos: works,
        }) =>
          works.length
            ? (
              <div className="p-[8px] w-full">
                <Table<IVolunteerDetail['activityWorkExperienceVos'][number]>
                  size="small"
                  style={{ marginInline: 8, marginBlock: 0 }}
                  bordered
                  pagination={false}
                  scroll={{ y: 200, x: '100%' }}
                  dataSource={works}
                  columns={[
                    {
                      title: '活动名称',
                      dataIndex: 'activityName',
                      className: 'max-w-[100px]',
                      ellipsis: true,
                    },
                    {
                      title: '岗位',
                      dataIndex: 'activityWorkNames',
                      ellipsis: true,
                    },
                    {
                      title: '转账金额',
                      dataIndex: 'activityTransferAmount',
                      render: amount => `${amount} 元`,
                      width: 200,
                    },
                  ]}
                  summary={
                    () => {
                      const totalAmount = totalActivityTransferAmount ?? works.reduce((acc, cur) => acc + cur.activityTransferAmount, 0);
                      const totalNum = activityWorkExperienceTotalNum || works.length;

                      return (
                        <Summary fixed>
                          <Row>
                            <Cell index={0} colSpan={3}>
                              合计：历史累计参与活动 {totalNum} 次，累计转账金额 {totalAmount} 元
                            </Cell>
                          </Row>
                        </Summary>
                      );
                    }
                  }
                />
              </div>
            )
            : '无'
      },
    ]}
  />
);