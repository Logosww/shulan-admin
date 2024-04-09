import type { ReactNode } from 'react';
import type { ActivityForm, IVolunteerWork } from '@/utils/http/api-types';

export enum FormOperation {
  append = 'append',
  modify = 'modify',
  copy = 'copy',
};

export interface IActivityFormProps {
  operation: FormOperation;
  id?: number;
  initialValues?: ActivityFormType; 
};

export type ActivityFormType = Omit<ActivityForm, 'coverUrl' | 'startAt' | 'endAt' | 'signUpStartAt' | 'signUpEndAt' | 'workList'> & {
  coverPath: string;
  dateRange: string[];
  signUpRange: string[];
  workList: Omit<IVolunteerWork, 'startAt' | 'endAt'> & {
    dateRange: string[];
  }[];
};

export const formOperationMap: string[] = [FormOperation.append, FormOperation.modify, FormOperation.copy];
export const formTitleMap: Record<FormOperation, string> = {
  [FormOperation.append]: '新增活动',
  [FormOperation.modify]: '编辑活动',
  [FormOperation.copy]: '复制活动',
};

export type PoiType = {
  id: string;
  name: string;
  address: string;
  location: string;
};

export type PoiOption = {
  key: string;
  label: ReactNode;
  value: string;
  detail: ActivityForm['addressDetail'];
};
