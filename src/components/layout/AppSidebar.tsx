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
  Menu,
  X,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { APP_VERSION, APP_NAME } from "@/lib/version";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
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
  { title: "Arsip Data", icon: Search, href: "/arsip" },
  { title: "Laporan", icon: BarChart3, href: "/laporan" },
  { title: "Data Penduduk", icon: Users, href: "/penduduk" },
  { title: "Pengaturan", icon: Settings, href: "/pengaturan", adminOnly: true },
  { title: "Manajemen User", icon: UserCog, href: "/users", adminOnly: true },
];

// Bottom nav shows top 5 most important items (Surat expands to Kependudukan)
const bottomNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Surat", icon: FileText, href: "/surat/kependudukan" },
  { title: "Arsip", icon: Search, href: "/arsip" },
  { title: "Laporan", icon: BarChart3, href: "/laporan" },
  { title: "Lainnya", icon: Menu, href: "__more__" },
];

export function AppSidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [openMenus, setOpenMenus] = useState<string[]>(["Buat Surat"]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

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

  const isSuratActive = () => location.pathname.startsWith("/surat");

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

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "A";

  // ── Desktop Sidebar ────────────────────────────────────────────────────
  const DesktopSidebar = (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen w-64 bg-sidebar text-sidebar-foreground flex-shrink-0",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Desa Sidoharjo</h1>
            <p className="text-xs text-sidebar-foreground/70">Sistem Pelayanan Digital</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          if (item.submenu) {
            const isOpen = openMenus.includes(item.title);
            const hasActiveChild = item.submenu.some((sub) => isActive(sub.href));
            return (
              <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleMenu(item.title)}>
                <CollapsibleTrigger className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  hasActiveChild && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-1 space-y-1">
                  {item.submenu.map((subitem) => (
                    <Link key={subitem.href} to={subitem.href} className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive(subitem.href) && "bg-sidebar-primary text-sidebar-primary-foreground"
                    )}>
                      <subitem.icon className="w-4 h-4" />
                      <span>{subitem.title}</span>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }
          return (
            <Link key={item.href} to={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive(item.href) && "bg-sidebar-primary text-sidebar-primary-foreground"
            )}>
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Operator"}</p>
            <p className="text-xs text-sidebar-foreground/70">{isAdmin ? "Administrator" : "Petugas"}</p>
          </div>
          <button onClick={handleLogout} disabled={isLoggingOut} title="Keluar"
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors disabled:opacity-50">
            {isLoggingOut
              ? <div className="w-4 h-4 rounded-full border-2 border-sidebar-foreground border-t-transparent animate-spin" />
              : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="px-4 pb-3 text-center">
        <p className="text-xs text-sidebar-foreground/30">{APP_NAME} v{APP_VERSION}</p>
      </div>
    </aside>
  );

  // ── Mobile Bottom Nav ──────────────────────────────────────────────────
  const MobileBottomNav = (
    <>
      {/* Full screen overlay menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background flex flex-col">
          {/* Overlay header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold">S</span>
              </div>
              <div>
                <p className="font-bold text-sm">Sidoharjo</p>
                <p className="text-xs text-muted-foreground">Sistem Pelayanan</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || "Operator"}</p>
              <p className="text-xs text-muted-foreground">{isAdmin ? "Administrator" : "Petugas"}</p>
            </div>
          </div>

          {/* Menu list */}
          <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {visibleItems.map((item) => {
              if (item.submenu) {
                const isOpen = openMenus.includes(item.title);
                const hasActiveChild = item.submenu.some((sub) => isActive(sub.href));
                return (
                  <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleMenu(item.title)}>
                    <CollapsibleTrigger className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      "hover:bg-muted",
                      hasActiveChild && "bg-primary/10 text-primary"
                    )}>
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link key={subitem.href} to={subitem.href} className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors",
                          "hover:bg-muted",
                          isActive(subitem.href) && "bg-primary text-primary-foreground"
                        )}>
                          <subitem.icon className="w-4 h-4" />
                          <span>{subitem.title}</span>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              return (
                <Link key={item.href} to={item.href} className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  "hover:bg-muted",
                  isActive(item.href) && "bg-primary text-primary-foreground"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-border space-y-2">
            <button onClick={handleLogout} disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
              {isLoggingOut
                ? <div className="w-5 h-5 rounded-full border-2 border-destructive border-t-transparent animate-spin" />
                : <LogOut className="w-5 h-5" />}
              Keluar
            </button>
            <p className="text-center text-xs text-muted-foreground/40">{APP_NAME} v{APP_VERSION}</p>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex items-stretch h-16">

          {/* Helper to render each tab */}
          {([
            { to: "/",                    label: "Dashboard", icon: LayoutDashboard, active: location.pathname === "/" },
            { to: "/surat/kependudukan",  label: "Surat",     icon: FileText,        active: isSuratActive() },
            { to: "/arsip",               label: "Arsip",     icon: Search,          active: isActive("/arsip") },
            { to: "/laporan",             label: "Laporan",   icon: BarChart3,       active: isActive("/laporan") },
          ] as { to: string; label: string; icon: React.ElementType; active: boolean }[]).map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative"
            >
              {/* Active top-line indicator */}
              {tab.active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              {/* Icon pill */}
              <span className={cn(
                "flex items-center justify-center w-10 h-6 rounded-full transition-colors",
                tab.active ? "bg-primary/15" : ""
              )}>
                <tab.icon className={cn("w-5 h-5", tab.active ? "text-primary" : "text-muted-foreground")} />
              </span>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                tab.active ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </Link>
          ))}

          {/* More */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 relative"
          >
            {mobileMenuOpen && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
            )}
            <span className={cn(
              "flex items-center justify-center w-10 h-6 rounded-full transition-colors",
              mobileMenuOpen ? "bg-primary/15" : ""
            )}>
              <Menu className={cn("w-5 h-5", mobileMenuOpen ? "text-primary" : "text-muted-foreground")} />
            </span>
            <span className={cn(
              "text-[10px] font-medium leading-none",
              mobileMenuOpen ? "text-primary" : "text-muted-foreground"
            )}>
              Lainnya
            </span>
          </button>

        </div>
      </nav>

    </>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileBottomNav}
    </>
  );
}