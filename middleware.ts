import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    const getRoleDashboard = (role: string) => {
      switch (role) {
        case "SUPER_ADMIN": return "/super-admin"
        case "ADMIN": return "/admin"
        case "CUSTOMER": return "/customer"
        default: return "/"
      }
    }

    // If user is logged in and trying to access login/register, redirect to appropriate dashboard
    if (token && ["/login", "/register"].includes(pathname)) {
      const dashboardUrl = getRoleDashboard(token.role as string)
      return NextResponse.redirect(new URL(dashboardUrl, req.url))
    }

        // Auto redirect from base paths to loyalty pages
        if (pathname === "/admin" && token?.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/loyalty", req.url))
        }
    
        if (pathname === "/customer" && token?.role === "CUSTOMER") {
          return NextResponse.redirect(new URL("/customer/loyalty", req.url))
        }

    // Redirect based on role
    if (pathname.startsWith("/customer") && token?.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    if (pathname.startsWith("/admin") && !["ADMIN", "SUPER_ADMIN"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    if (pathname.startsWith("/super-admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Public routes
        if (["/", "/login", "/register"].includes(pathname)) {
          return true
        }

        // Protected routes require token
        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/customer/:path*", "/admin/:path*", "/super-admin/:path*",     "/login",      "/register" ]
}
