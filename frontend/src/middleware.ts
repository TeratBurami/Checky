import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// --- CONFIGURATION ---

const publicRoutes = [
  '/login',
  '/register',
];

// Routes accessible by any logged-in user
const commonPrivateRoutes = [
  '/',
  '/class',
  '/notification',
];

// Routes exclusive to a specific role
const roleSpecificRoutes = {
  student: [
    '/peer-review',
  ],
  teacher: [
    '/rubric',
  ],
};


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('role')?.value as 'student' | 'teacher' | undefined;
  const isLoggedIn = !!userRole;

  // --- Redirect logged-in users from public pages ---
  const isPublicRoute = publicRoutes.includes(pathname);
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // --- Protect routes and enforce role-based access ---
  if (!isPublicRoute) {
    // Redirect if not logged in
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // --- NEW, MORE EXPLICIT AUTHORIZATION LOGIC ---

    // 1. Check if the route is a common private route
    const isCommonRoute = commonPrivateRoutes.some((route) => {
      if (route === '/') return pathname === route;
      return pathname.startsWith(route);
    });

    if (isCommonRoute) {
      return NextResponse.next(); // Access granted
    }

    // 2. If not common, check if it's a route specific to the user's role
    const allowedSpecificRoutes = roleSpecificRoutes[userRole] || [];
    const isAllowedSpecific = allowedSpecificRoutes.some((route) => pathname.startsWith(route));

    if (isAllowedSpecific) {
      return NextResponse.next(); // Access granted
    }
    
    // 3. If it's not a common route or an allowed specific route, deny access
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Updated matcher to exclude static files like images
  matcher: '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|ico)$).*)',
};

