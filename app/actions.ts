'use server';

import { cookies } from 'next/headers';

export async function getCookie(name: string) {
  return (await cookies()).get(name);
};