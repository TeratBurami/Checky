import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ดึง path ปัจจุบัน และค่า role จาก cookie
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('role')?.value;

  // ตรวจสอบสถานะการ Login
  const isLoggedIn = userRole === 'teacher' || userRole === 'student';

  // --- LOGIC การ REDIRECT ---

  // 1. ถ้า Login อยู่แล้ว (isLoggedIn=true) และกำลังจะไปหน้า /login
  if (isLoggedIn && pathname === '/login') {
    // ให้ redirect ไปที่หน้า home ('/') ทันที
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. ถ้ายังไม่ได้ Login (isLoggedIn=false) และกำลังจะไปหน้าอื่นที่ไม่ใช่ /login
  if (!isLoggedIn && pathname !== '/login') {
    // ให้ redirect ไปที่หน้า /login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. ถ้าไม่เข้าเงื่อนไขข้างบนเลย (เช่น login แล้วไปหน้าอื่น หรือยังไม่ login และกำลังจะไปหน้า login)
  // ก็อนุญาตให้ไปต่อได้ตามปกติ
  return NextResponse.next();
}

export const config = {
  /*
   * Regex นี้จะจับคู่กับทุก path ยกเว้น path ที่ขึ้นต้นด้วย:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * เพื่อให้ middleware ไม่ทำงานกับไฟล์พวก assets ที่ไม่จำเป็น
   */
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};