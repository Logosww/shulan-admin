import type { ReactNode } from 'react';
import type {
  Role,
  Gender,
  AdminAccoutState,
  ActivityType,
  ActivityState,
  ActivityFeature,
  VolunteerIdentity,
  VolunteerType,
  VolunteerSignUpState,
  VolunteerWhitelistState,
  BannerType,
  WorkTag,
  IdCardType,
  NotificationType,
  NotificationState,
  PayrollState,
  NoticeState,
  PayrollAPIState,
} from '@/constants/value-enum';

export interface ILoginForm {
  phone: string;
  code: string;
}

export interface IUserProfile {
  id: number;
  name: string;
  sex: Gender;
  desensitizedPhone: string;
  role: Role;
}

export interface IPagingParams {
  page: number;
  size: number;
}

export interface IPagingResult<T> {
  page: number;
  size: number;
  pages: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
  records: T[];
}

export interface IAdminAccount {
  id: number;
  name: string;
  sex: Gender;
  purePhoneNumber: string;
  state: AdminAccoutState;
  role?: Role;
}

export interface IActivityDetail {
  id: number;
  name: string;
  coverUrl: string;
  city: string;
  address: string;
  type: ActivityType;
  state: ActivityState;
  startAt: string;
  endAt: string;
  signupStartAt: string;
  signupEndAt: string;
  signupCancelAt: string;
  signupSuccessCount: number;
  manager: IAdminAccount;
  reviewer: IAdminAccount;
  addressDetail: {
    detail: string;
    longitude: string;
    latitude: string;
  };
  announcement: string;
  features: ActivityFeature[];
  workList: IVolunteerWork[];
  isDisplay: boolean;
  isWhite: boolean;
  description: string;
  isWorkInstruction: boolean;
  isCheck: boolean;
  isMoney: boolean;
  isStudentVerify: boolean;
}

export type ActivityPreview = Pick<
  IActivityDetail,
  | 'id'
  | 'name'
  | 'city'
  | 'address'
  | 'state'
  | 'coverUrl'
  | 'startAt'
  | 'endAt'
>;

export interface IVolunteerWork {
  id: number;
  name: string;
  isFull: boolean;
  startAt: string;
  endAt: string;
  money: number;
  integral: number;
  label: WorkTag;
  description: string;
  signupSuccessCount?: number;
}

export type VolunteerWorkForm = Omit<
  IVolunteerWork,
  'id' | 'label' | 'isFull' | 'signupSuccessCount'
>;

export type ActivityForm = Omit<
  IActivityDetail,
  'id' | 'state' | 'signupSuccessCount' | 'manager' | 'reviewer'
>;

export interface IVolunteer {
  id: number;
  name: string;
  sex: Gender;
  age: number;
  countryCode: string;
  purePhoneNumber: string;
  state: VolunteerWhitelistState;
  identity: VolunteerIdentity;
  createAt: string;
  reviewerName: string;
  reviewAt: string;
  isStudentVerified: boolean;
}

export interface IVolunteerDetail
  extends Omit<IVolunteer, 'createAt' | 'identity' | 'state'> {
  nickname: string;
  avatarUrl: string;
  idCard: string;
  idCardType: IdCardType;
  idCardPortraitUrl: string;
  idCardNationalUrl: string;
  idPhotoUrl: string;
  experience: string;
  experiencePicUrls: string[];
  volunteerIdentityVo: {
    school: string;
    grade: string;
    major: string;
    studentCardPicUrls: string[];
    jobUnit: string;
    identityCertPicUrls: string[];
  };
  stateVo: {
    violateCount: number;
    currentViolateCount: number;
    violateAt: string;
    releaseAt: string;
    whiteListExpireAt: string;
    blackReason: string;
  };
  activityWorkExperienceTotalNum: number;
  activityWorkExperienceVos: {
    id: number;
    activityName: string;
    activityWorkNames: string;
    activityWorkAt: string;
    activityTransferAmount: number;
  }[];
  totalActivityTransferAmount?: number;
}

export type NullableFilter<T> = {
  [K in keyof T]: T[K] | null;
};

export type OptionType<T extends string | number = number> = {
  label: ReactNode;
  value: T;
};

export interface ICOSBucketCredentials {
  credentials: {
    tmpSecretId: string;
    tmpSecretKey: string;
    sessionToken: string;
  };
  startTime: number;
  expiredTime: number;
}

export interface ISignUpRecord {
  id: number;
  purePhoneNumber: string;
  name: string;
  sex: Gender;
  age: number;
  volunteerState: VolunteerWhitelistState;
  activityWork: { id: number; label: string };
  activityWorkVolunteerState: VolunteerSignUpState;
  activityWorkVolunteerIdentity: VolunteerType;
  useWhite: boolean;
  joinAt: string;
  reviewerName: string;
  reviewAt: string;
  ip: string;
  isStudentVerified: boolean;
  householdRegister: string[];
}

export type SignUpRecordDetail = ISignUpRecord &
  IVolunteerDetail & {
    reason: string;
    identityAt: string;
  };

export type TemporaryVolunteerForm = {
  id: number;
  volunteerIds: number[];
  activityWorkVolunteerIdentity: VolunteerType;
  money: number;
  integral: number;
  remark: string;
};

export interface ISettingForm {
  activityCancelCountLimit: number;
  violateCountLimit: number;
  whiteExpire: number;
  violateExpire: number;
}

export interface IBanner {
  id: number;
  type: BannerType;
  coverUrl: string;
  targetId: number;
  targetName: string;
  miniProgramAppid: string;
  miniProgramPagePath: string;
  isDisplay: boolean;
}

export interface IOption {
  id: number;
  label: string;
}

export interface IActivityStatistics {
  totalClick: number;
  totalShare: number;
  totalSignUp: number;
  tobeAudit: number;
  auditPass: number;
  auditReject: number;
  cancelled: number;
  illegalCancelled: number;
  atWork: number;
  offWork: number;
  finished: number;
  worksVolume: {
    id: number;
    name: string;
    volume: number;
  }[];
}

export interface ILive {
  id: number;
  coverUrl: string;
  articleUrl: string;
  title: string;
  digest: string;
}

export interface INotification {
  id: number;
  title: string;
  createAt: string;
  type: NotificationType;
  state: NotificationState;
  senderName: string;
  content: string;
}

export interface ICertificate {
  id: number;
  title: string;
  coverUrl: string;
}

export interface ICheckinRecord {
  id: number;
  purePhoneNumber: string;
  name: string;
  age: string;
  sex: Gender;
  activityWork: {
    id: string;
    label: string;
  };
  activityWorkVolunteerIdentity: VolunteerType;
  isChecked: boolean;
  checkAt: string;
  reviewerName: string;
}

export interface IPayrollRecord {
  id: number;
  name: string;
  phone: string;
  shouldTransferMoney: number;
  actualTransferMoney: number;
  paidTime: string;
  remark: string;
  wxmpUserTransferOrderState: PayrollState;
  activityWorkVolunteerIdentity: VolunteerType;
  activityWork: {
    id: number;
    label: string;
  };
}

export interface IPaymentPreview {
  totalNumber: number;
  totalMoney: number;
  tips: string;
  workPreviewVo: {
    name: string;
    localNumber: number;
    localMoney: number;
  }[];
}

export interface IPayrollDetail {
  outDetailNo: string;
  transferAmount: number;
  detailStatus: PayrollAPIState;
  transferorName: string;
  transferRemark: string;
  transferAt: string;
  openid: string;
  failReason: string;
}

export interface INoticeRecord {
  id: number;
  name: string;
  phone: string;
  activityWorkVolunteerState: VolunteerSignUpState;
  activityWorkVolunteerIdentity: VolunteerType;
  activityWork: {
    id: number;
    label: string;
  };
  readState: NoticeState;
  sendCount: number;
  senderName: string;
  sendAt: string;
}

export interface INotice {
  title: string;
  rawContent: string;
  htmlContent: string;
}

export type AuditRejectVolunteersForm = Pick<
  ISignUpRecord,
  | 'id'
  | 'name'
  | 'sex'
  | 'purePhoneNumber'
  | 'activityWorkVolunteerState'
  | 'volunteerState'
  | 'activityWorkVolunteerIdentity'
  | 'ip'
  | 'isStudentVerified'
  | 'householdRegister'
> & {
  activityId: number;
  activityWorkId: number;
  volunteerIdentity: VolunteerIdentity;
  school: string;
  hasActivityExperience: boolean;
  activityCount: number;
  searchActivityId: number;
};

export interface IRiskUser {
  id: number;
  name: string;
  phone: string;
  idCardType: IdCardType;
  idCard: string;
  onceCertified: boolean;
  ip: string;
  operator: string;
  createAt: string;
}
