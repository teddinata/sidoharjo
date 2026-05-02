import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Search,
  BarChart3,
  Settings,
  Home,
  Users,
  ChevronDown,
  Store,
  Shield,
  LogOut,
  UserCog,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { APP_VERSION, APP_NAME } from "@/lib/version";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Buat Surat",
    icon: FileText,
    href: "/surat",
    submenu: [
      { title: "Kependudukan", icon: Home, href: "/surat/kependudukan" },
      { title: "Usaha & Ekonomi", icon: Store, href: "/surat/usaha" },
      { title: "Lainnya", icon: Shield, href: "/surat/lainnya" },
    ],
  },
  {
    title: "Arsip Data",
    icon: Search,
    href: "/arsip",
  },
  {
    title: "Laporan",
    icon: BarChart3,
    href: "/laporan",
  },
  {
    title: "Data Penduduk",
    icon: Users,
    href: "/penduduk",
  },
  {
    title: "Pengaturan",
    icon: Settings,
    href: "/pengaturan",
    adminOnly: true,
  },
  {
    title: "Manajemen User",
    icon: UserCog,
    href: "/users",
    adminOnly: true,
  },
];

export function AppSidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [openMenus, setOpenMenus] = useState<string[]>(["Buat Surat"]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Gagal logout. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Ambil inisial nama user
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A";

  return (
    <aside
      className={cn(
        "flex flex-col h-screen w-64 bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">
              S
            </span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Desa Sidoharjo</h1>
            <p className="text-xs text-sidebar-foreground/70">
              Sistem Pelayanan Digital
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          if (item.submenu) {
            const isOpen = openMenus.includes(item.title);
            const hasActiveChild = item.submenu.some((sub) =>
              isActive(sub.href)
            );

            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={() => toggleMenu(item.title)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    hasActiveChild &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-1 space-y-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.href}
                      to={subitem.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive(subitem.href) &&
                          "bg-sidebar-primary text-sidebar-primary-foreground"
                      )}
                    >
                      <subitem.icon className="w-4 h-4" />
                      <span>{subitem.title}</span>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive(item.href) &&
                  "bg-sidebar-primary text-sidebar-primary-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer — User info + Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || "Operator"}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {isAdmin ? "Administrator" : "Petugas"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Keluar"
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 rounded-full border-2 border-sidebar-foreground border-t-transparent animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="px-4 pb-3 text-center">
        <p className="text-xs text-sidebar-foreground/30">
          {APP_NAME} v{APP_VERSION}
        </p>
      </div>
    </aside>
  );
}