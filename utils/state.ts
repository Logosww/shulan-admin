'use server';

import { Role } from "@/constants";
import { cookies } from "next/headers";

let token: string | undefined, role: Role | undefined;

export const getInitialState = () => {
  token = token ?? (cookies().get('Authorization')?.value || '');
  role =  role ?? (parseInt(cookies().get('Role')?.value ?? '') || Role.user) as Role;
  return { token, role };
};