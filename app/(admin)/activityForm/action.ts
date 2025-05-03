'use server';

import { HttpClient } from "@/utils";
import { cookies } from "next/headers";

import type { ActivityFormType } from ".";

export const getFormInitialValues = async (activityId?: number) => {
  if(!activityId) return Promise.resolve(void 0);
  
  const cookie = (await cookies()).getAll().map(({ name, value }) => `${name}=${value}`).join('; ');
  const activityFormRaw = await HttpClient.getActivityDraft({ id: activityId }, { headers: { 'Cookie': cookie }});
  if(!activityFormRaw) return void 0;

  const activityForm: Record<string, any> = { ...activityFormRaw };
  const { startAt, endAt, coverUrl, signupStartAt, signupEndAt, workList } = activityFormRaw;
  activityForm['coverPath'] = coverUrl;
  activityForm['dateRange'] = [startAt, endAt];
  activityForm['signUpRange'] = [signupStartAt, signupEndAt];
  activityForm['workList'] = workList.map(work => ({ ...work, dateRange: [work.startAt, work.endAt] }));

  return activityForm as ActivityFormType;
};