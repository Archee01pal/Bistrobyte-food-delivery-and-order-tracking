import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const userRole = req.cookies.get('user_role')?.value;
  const token = req.cookies.get('accessToken')?.value;
  const { pathname } = req.nextUrl;

  // Protect Driver Portal
  if (pathname.startsWith('/driver') && userRole !== 'DRIVER' && userRole !== 'SYSTEM_ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protect Restaurant Manager Dashboard
  if (pathname.startsWith('/restaurant') && userRole !== 'RESTAURANT_MANAGER' && userRole !== 'SYSTEM_ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protect System Admin Analytics
  if (pathname.startsWith('/admin') && userRole !== 'SYSTEM_ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/driver/:path*', '/restaurant/:path*', '/admin/:path*'],
};