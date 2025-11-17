import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = ['/login', '/register'];

const studentOnlyRoutes = [
  '/peer-review',
  '/ai-analysis',
  '/performance',
  '/exercise',
  '/practice',
];

const teacherOnlyRoutes = [
  '/rubric',
  '/class/create',
  '/class/edit',
  '/assignment/create',
  '/assignment/edit',
];

const allPrivateRoutes = [
  '/',
  '/class',
  '/notification',
  '/assignment',
];

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

  if (!isPublicRoute && !isLoggedIn && !tokenIsInvalid) {
    response = NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && !isPublicRoute) {
    const isTeacherOnlyPath = teacherOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const isStudentOnlyPath = studentOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isTeacherOnlyPath) {
      if (userRole !== 'teacher') {
        response = NextResponse.redirect(new URL('/', request.url));
      }

    } else if (isStudentOnlyPath) {
      if (userRole !== 'student') {
        response = NextResponse.redirect(new URL('/', request.url));
      }

    } else {
      const isSharedPrivateRoute = allPrivateRoutes.some((route) => {
        if (route === '/') return pathname === route;
        return pathname.startsWith(route);
      });
      
      if (!isSharedPrivateRoute) {
         response = NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  if (tokenIsInvalid) {
    if (!isPublicRoute) {
      response = NextResponse.redirect(new URL('/login', request.url));
    }
    response.cookies.delete('token');
  }

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|ico)$).*)',
};