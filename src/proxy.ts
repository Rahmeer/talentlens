import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const path = nextUrl.pathname;

  // Public routes — always accessible
  const publicRoutes = ["/", "/jobs", "/login", "/signup"];
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith("/jobs/")
  );
  const isApiRoute = path.startsWith("/api/");
  const isStaticRoute = path.startsWith("/_next/") || path.startsWith("/favicon");

  if (isStaticRoute || isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (path === "/login" || path === "/signup")) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/candidate/dashboard", nextUrl));
  }

  // Public routes don't need auth
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected admin routes
  if (path.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/candidate/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Protected candidate routes
  if (path.startsWith("/candidate")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
  }

  // Default: require auth
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
