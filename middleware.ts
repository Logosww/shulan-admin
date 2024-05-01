import { NextRequest, NextResponse } from 'next/server';

import type { MiddlewareConfig } from 'next/server';

export const config: MiddlewareConfig = {
  runtime: 'experimental-edge',
  matcher: [{
    // @ts-ignore
    source: '/((?!_next/static|_next/image|image|api|favicon.ico).*)',
    missing:  [
      { type: 'header', key: 'next-router-prefetch' },
      { type: 'header', key: 'purpose', value: 'prefetch' },
    ],
  }],
  unstable_allowDynamicGlobs: [
    // package 'useHooks-ts' import 'lodash.debounce' globally which contains APIs (new Function) that Next edge runtime does not support,
    // and it cannot be tree-shaked, so use 'unstable_allowDynamic' config to exlude specific module
    // this glob differs with your package manger
    '/node_modules/.pnpm/lodash.debounce@4.0.8/**',
  ],
};

export function middleware(request: NextRequest) {
  let response = NextResponse.next();
  // const isLogin = request.cookies.has('Authorization');
  // if(request.nextUrl.pathname.startsWith('/login')) isLogin && (response = NextResponse.redirect(new URL('/', request.url)));
  // else !isLogin && (response = NextResponse.redirect(new URL('/login', request.url)));

  return response;
};