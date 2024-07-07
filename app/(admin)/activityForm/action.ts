'use server';

import { HttpClient } from "@/utils";
import dayjs from "dayjs";

import type { ActivityFormType } from ".";

export const getFormInitialValues = async (activityId?: number) => {
  if(!activityId) return Promise.resolve(void 0);
  
  const activityFormRaw = await HttpClient.getActivityDraft({ id: activityId });
  const activityForm: Record<string, any> = { ...activityFormRaw };
  const { startAt, endAt, coverUrl, signupStartAt, signupEndAt, signupCancelAt, workList } = activityFormRaw;
  activityForm['coverPath'] = coverUrl;
  activityForm['signupCancelAt'] = dayjs(signupCancelAt);
  activityForm['dateRange'] = [dayjs(startAt), dayjs(endAt)];
  activityForm['signUpRange'] = [dayjs(signupStartAt), dayjs(signupEndAt)];
  activityForm['workList'] = workList.map(work => ({ ...work, dateRange: [dayjs(work.startAt), dayjs(work.endAt)] }));

  return activityForm as ActivityFormType;
};