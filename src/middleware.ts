import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME, RIDER_COOKIE, getSecret } from "@/server/authConfig";

// Page-level guards for /admin/* and /rider/*. API routes additionally verify the session themselves.
async function hasRole(req: NextRequest, cookie: string, role: string) {
  const secret = getSecret(); const token = req.cookies.get(cookie)?.value;
  if (!secret || !token) return false;
  try { return (await jwtVerify(token, secret)).payload.role === role; } catch { return false; }
}
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const zone = pathname.startsWith("/rider") ? { base: "/rider", cookie: RIDER_COOKIE, role: "rider" } : { base: "/admin", cookie: COOKIE_NAME, role: "admin" };
  if (pathname === "/rider/register") return NextResponse.next(); // public: new riders apply here
  const authed = await hasRole(req, zone.cookie, zone.role);
  const isLogin = pathname === `${zone.base}/login`;
  if (!authed && !isLogin) { const u = req.nextUrl.clone(); u.pathname = `${zone.base}/login`; u.search = ""; return NextResponse.redirect(u); }
  if (authed && isLogin) { const u = req.nextUrl.clone(); u.pathname = zone.base; return NextResponse.redirect(u); }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/rider/:path*"] };
