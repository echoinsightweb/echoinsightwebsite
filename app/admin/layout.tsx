"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  History, 
  Settings, 
  LogOut, 
  MessageSquare,
  Ban,
  CreditCard,
  BarChart3
} from "lucide-react";
import { SessionProvider } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Upcoming", href: "/admin/upcoming", icon: CalendarDays },
  { name: "History", href: "/admin/history", icon: History },
  { name: "Cancelled", href: "/admin/cancelled", icon: Ban },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  { name: "Manual Booking", href: "/admin/manual-booking", icon: CalendarDays },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminSidebar() {
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") return null;

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-wider">ECHO & INSIGHT</h2>
        <p className="text-xs text-gray-400 mt-1">Admin Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        {!isLoginPage && <AdminSidebar />}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
