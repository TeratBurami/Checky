import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = ['/login', '/register'];
const commonPrivateRoutes = ['/', '/class', '/notification'];
const roleSpecificRoutes = {
  student: ['/peer-review'],
  teacher: ['/rubric','/class/create'],
};

interface JwtPayload {
  userid: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher';
  iat: number;
  exp: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('token')?.value;
  
  let userRole: 'student' | 'teacher' | undefined;
  let isLoggedIn = false;
  let tokenIsInvalid = false;

  if (token) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in .env.local');
      }
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify<JwtPayload>(token, secret);

      userRole = payload.role;
      isLoggedIn = true;

    } catch (e: any) {
      console.warn('Invalid token:', e.message);
      tokenIsInvalid = true;
      isLoggedIn = false;
    }
  }
  
  const isPublicRoute = publicRoutes.includes(pathname);

  let response = NextResponse.next();

  if (isLoggedIn && isPublicRoute) {
    response = NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicRoute) {
    if (!isLoggedIn) {
      response = NextResponse.redirect(new URL('/login', request.url));
    } else {
      const isCommonRoute = commonPrivateRoutes.some((route) => {
        if (route === '/') return pathname === route;
        return pathname.startsWith(route);
      });

      if (isCommonRoute) {
        response = NextResponse.next();
      } else {
        const allowedSpecificRoutes = roleSpecificRoutes[userRole!] || []; 
        const isAllowedSpecific = allowedSpecificRoutes.some((route) =>
          pathname.startsWith(route)
        );

        if (isAllowedSpecific) {
          response = NextResponse.next();
        } else {
          response = NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
  }

  if (tokenIsInvalid) {
    if (pathname !== '/login' && pathname !== '/register') {
         response = NextResponse.redirect(new URL('/login', request.url));
    }
    response.cookies.delete('token');
  }

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|ico)$).*)',
};