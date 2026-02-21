import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const isAuthenticated = !!req.auth;

  // 관리자 페이지 접근 시 인증 체크
  if (isAdminRoute && !isLoginPage && !isAuthenticated) {
    return Response.redirect(new URL("/admin/login", req.url));
  }

  // 이미 로그인된 상태에서 로그인 페이지 접근 시 대시보드로 리다이렉트
  if (isLoginPage && isAuthenticated) {
    return Response.redirect(new URL("/admin", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
