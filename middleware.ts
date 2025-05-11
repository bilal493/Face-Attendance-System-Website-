import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login"

  // Get the token from the cookies
  const isAuthenticated = request.cookies.has("user")

  // // Redirect logic
  // if (isPublicPath && isAuthenticated) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url))
  // }

  // if (!isPublicPath && !isAuthenticated) {
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }

  return NextResponse.next()
}

// Configure the paths that should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
