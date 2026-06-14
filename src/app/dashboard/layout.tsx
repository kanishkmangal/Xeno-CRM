import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { handleSignOut } from "@/actions/auth-actions";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Layers,
  Send,
  BarChart3,
  LogOut,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Segments", href: "/dashboard/segments", icon: Layers },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Send },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-zinc-900 border-r border-zinc-800">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 space-x-2">
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              ShopperCRM
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
              >
                <item.icon className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User profile / Log out footer */}
        <div className="flex-shrink-0 flex border-t border-zinc-800 p-4 bg-zinc-900/50">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-300">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-200 truncate max-w-[120px]">
                  {session.user?.name || "Admin"}
                </span>
                <span className="text-xs text-zinc-500 truncate max-w-[120px]">
                  {session.user?.email}
                </span>
              </div>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800/80 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex flex-col md:pl-64 flex-1">
        {/* Mobile top-bar */}
        <header className="md:hidden flex items-center justify-between h-16 px-6 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-md font-bold text-white">ShopperCRM</span>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4 text-xs">
              <Link href="/dashboard" className="text-zinc-300 hover:text-white">
                Home
              </Link>
              <Link href="/dashboard/campaigns" className="text-zinc-300 hover:text-white">
                Campaigns
              </Link>
            </nav>
            <form action={handleSignOut}>
              <button type="submit" className="text-zinc-400 hover:text-red-400">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
