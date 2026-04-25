import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SITE_MODE = process.env.NEXT_PUBLIC_SITE_MODE || "public";
const isPrivateMode = SITE_MODE === "private";

const privateOnlyPaths = ["/novels", "/movies", "/english"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In public mode, only protect private-only paths
  if (!isPrivateMode) {
    const isPrivatePath = privateOnlyPaths.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (!isPrivatePath) {
      return NextResponse.next();
    }
  }

  // Basic auth check
  const expectedUser = process.env.PRIVATE_USER || "admin";
  const expectedPass = process.env.PRIVATE_PASSWORD;

  if (!expectedPass) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");
  const expected =
    "Basic " +
    Buffer.from(`${expectedUser}:${expectedPass}`).toString("base64");

  if (auth !== expected) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Private Area"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
