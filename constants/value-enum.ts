import type { ProSchemaValueEnumType } from '@ant-design/pro-components';

export enum Role {
  user = 0,
  volunteer = 1,
  admin = 2,
  superAdmin = 3,
};

export enum Gender {
  male = 0,
  female = 1,
  unknown = 2,
};

export enum AdminAccoutState {
  normal = 0,
  disabled = 1,
};

export enum ActivityType {
  concert = 0,
  drama = 1,
  talkshow = 2,
  musicFestival = 3,
  sports = 4,
};

export enum ActivityState {
  awaitingSubmit = 0,
  awaitingAudit = 1,
  auditFailed = 2,
  auditPassed = 3,
  activated = 4,
  finished = 5,
};

export enum ActivityFeature {
  insurance = 0,
  meal = 1,
  water = 2,
  clothes = 3,
  money = 4,
  band = 5,
};

export enum VolunteerIdentity {
  student = 0,
  socialFigure = 1,
};

export enum VolunteerType {
  normal = 0,
  temporary = 1,
  personInCharge = 2,
};

export enum VolunteerSignUpState {
  awaitingAudit = 0,
  auditPassed = 1,
  auditFailed = 2,
  cancelled = 3,
  cancelledOutOfIllegal = 4,
  atWork = 5,
  finished = 6,
  offWork = 7,
};

export enum VolunteerWhitelistState {
  normal = 0,
  ignored = 1,
  whitelist = 2,
  forbidden = 3,
};

export enum WorkTag {
  normal = 0,
  appended = 1,
};

export enum BannerType {
  activity = 0,
  live = 1,
  none = 2,
  miniprogram = 3,
};

export enum IdCardType {
  mainlandIdCard = 0,
  HTMPass = 1,
  password = 2
};

export enum NotificationState {
  unread = 0,
  read = 1,
};

export enum NotificationType {
  message = 0,
};

export enum PayrollState {
  unpaid = 0,
  proccessing = 1,
  paid = 2,
  fail = 3,
};

export enum PayrollAPIState {
  init = 0,
  awaitConfirm = 1,
  processing = 2,
  success = 3,
  fail = 4,
};

export enum APIStatusCode {
  fail = 0,
  success = 1,
};

export enum NoticeState {
  unread = 0,
  read = 1,
};

export const genderValueEnumMap = new Map<Gender, string>()
  .set(Gender.male, '男')
  .set(Gender.female, '女')
  .set(Gender.unknown, '未知');

export const adminAccnoutStateValueEnumMap = new Map<AdminAccoutState, ProSchemaValueEnumType>()
  .set(AdminAccoutState.normal, { text: '正常', status: 'Success' })
  .set(AdminAccoutState.disabled, { text: '停用', status: 'Error' });

export const activityTypeValueEnumMap = new Map<ActivityType, string>()
  .set(ActivityType.concert, '演唱会')
  .set(ActivityType.drama, '话剧')
  .set(ActivityType.talkshow, '脱口秀')
  .set(ActivityType.musicFestival, '音乐节')
  .set(ActivityType.sports, '体育');

export const activityStateValueEnumMap = new Map<ActivityState, ProSchemaValueEnumType>()
  .set(ActivityState.awaitingSubmit, { text: '拟草稿', status: 'warning' })
  .set(ActivityState.awaitingAudit, { text: '待审核', status: 'geekblue' })
  .set(ActivityState.auditFailed, { text: '已退回', status: 'error' })
  .set(ActivityState.auditPassed, { text: '待开始', status: 'processing' })
  .set(ActivityState.activated, { text: '进行中', status: 'success' })
  .set(ActivityState.finished, { text: '已结束', status: 'default' });

export const activityFeatureValueEnumMap = new Map<ActivityFeature, string>()
  .set(ActivityFeature.insurance, '工作保险')
  .set(ActivityFeature.meal, '工作餐')
  .set(ActivityFeature.water, '饮用水')
  .set(ActivityFeature.clothes, '工作马甲')
  .set(ActivityFeature.money, '工资补贴')
  .set(ActivityFeature.band, '工作手环');

export const volunteerTypeValueEnumMap = new Map<VolunteerType, ProSchemaValueEnumType>()
  .set(VolunteerType.normal, { text: '正常报名', status: 'success' })
  .set(VolunteerType.temporary, { text: '临时', status: 'processing' })
  .set(VolunteerType.personInCharge, { text: '负责人', status: 'warning' });

export const volunteerSignUpStateValueEnumMap = new Map<VolunteerSignUpState, string>()
  .set(VolunteerSignUpState.awaitingAudit, '待审核')
  .set(VolunteerSignUpState.auditPassed, '审核通过')
  .set(VolunteerSignUpState.auditFailed, '审核不通过')
  .set(VolunteerSignUpState.cancelled, '手动取消')
  .set(VolunteerSignUpState.cancelledOutOfIllegal, '违规取消')
  .set(VolunteerSignUpState.atWork, '进行中')
  .set(VolunteerSignUpState.offWork, '未到岗')
  .set(VolunteerSignUpState.finished, '已完成');

export const volunteerWhitelistStateValueEnumMap = new Map<VolunteerWhitelistState, ProSchemaValueEnumType>()
  .set(VolunteerWhitelistState.normal, { text: '正常', status: 'success' })
  .set(VolunteerWhitelistState.ignored, { text: '黑名单', status: 'warning' })
  .set(VolunteerWhitelistState.whitelist, { text: '白名单', status: 'processing' })
  .set(VolunteerWhitelistState.forbidden, { text: '禁止报名', status: 'error' });

export const volunteerTypeForFormValueEnumMap = new Map<VolunteerType, string>()
  .set(VolunteerType.temporary, '临时志愿者')
  .set(VolunteerType.personInCharge, '负责人');

export const volunteerIdentityValueEnumMap = new Map<VolunteerIdentity, string>()
  .set(VolunteerIdentity.student, '学生')
  .set(VolunteerIdentity.socialFigure, '社会人士');

export const bannerTypeValueEnumMap = new Map<BannerType, string>()
  .set(BannerType.activity, '活动')
  .set(BannerType.live, '现场回顾')
  .set(BannerType.none, '不跳转')
  .set(BannerType.miniprogram, '小程序');

export const workTagValueEnumMap = new Map<WorkTag, ProSchemaValueEnumType>()
  .set(WorkTag.normal, { text: '正常', status: 'processing' })
  .set(WorkTag.appended, { text: '补录', status: 'warning' });

export const idCardTypeValueEnumMap = new Map<IdCardType, string>()
  .set(IdCardType.mainlandIdCard, '中国大陆居民身份证')
  .set(IdCardType.HTMPass, '港澳台通行证')
  .set(IdCardType.password, '护照');

export const notificationTypeValueEnumMap = new Map<NotificationType, ProSchemaValueEnumType>()
  .set(NotificationType.message, { text: '通知', status: 'processing' });

export const isCheckedValueEnumMap = new Map<boolean, string>()
  .set(true, '是')
  .set(false, '否');

export const payrollStateValueEnumMap = new Map<PayrollState, ProSchemaValueEnumType>()
  .set(PayrollState.unpaid, { text: '待打款', status: 'warning' })
  .set(PayrollState.proccessing, { text: '处理中', status: 'processing' })
  .set(PayrollState.paid, { text: '已到账', status: 'success' })
  .set(PayrollState.fail, { text: '转账失败', status: 'error' });

export const payrollAPIStateValueEnumMap = new Map<PayrollAPIState, string>()
  .set(PayrollAPIState.init, '转账校验中')
  .set(PayrollAPIState.awaitConfirm, '商户待确认')
  .set(PayrollAPIState.processing, '转账中')
  .set(PayrollAPIState.success, '转账成功')
  .set(PayrollAPIState.fail, '转账失败');

export const noticeStateValueEnumMap = new Map<NoticeState, string>()
  .set(NoticeState.unread, '未读')
  .set(NoticeState.read, '已读');

export const hasActivityExperienceValueEnumMap = new Map<boolean, string>()
  .set(false, '未参与')
  .set(true, '已参与');