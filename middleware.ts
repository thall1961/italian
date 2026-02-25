import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes — always allowed
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Cron routes — protected by CRON_SECRET bearer token
  if (pathname.startsWith("/api/cron")) {
    const auth = req.headers.get("authorization");
    const expected = process.env.CRON_SECRET;
    if (expected && auth === `Bearer ${expected}`) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Everything else — verify JWT session cookie
  const token = req.cookies.get("session")?.value;
  if (token) {
    const userId = await verifyToken(token);
    if (userId) {
      return NextResponse.next();
    }
  }

  // Not authenticated — redirect to login (or 401 for API routes)
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
