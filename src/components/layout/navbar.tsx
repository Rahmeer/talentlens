import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { Sparkles, Menu, LogOut, LayoutDashboard, Briefcase, User } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Talent<span className="gradient-text">Lens</span>
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/jobs"
              className="px-4 py-2 text-sm font-medium text-gray-400 rounded-lg hover:text-white hover:bg-white/5 transition-all"
            >
              Browse Jobs
            </Link>
            {session?.user?.role === "ADMIN" && (
              <>
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-400 rounded-lg hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/jobs"
                  className="px-4 py-2 text-sm font-medium text-gray-400 rounded-lg hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  Manage Jobs
                </Link>
              </>
            )}
            {session?.user?.role === "CANDIDATE" && (
              <Link
                href="/candidate/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-400 rounded-lg hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                My Applications
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm text-gray-300">{session.user.name}</span>
                </div>
                <form action={logoutAction}>
                  <Button variant="ghost" size="sm" type="submit">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
