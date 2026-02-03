import { Link, useLocation } from "react-router-dom";
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
  LogOut
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

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
  },
];

export function AppSidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(["Buat Surat"]);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={cn("flex flex-col h-screen w-64 bg-sidebar text-sidebar-foreground", className)}>
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
        {menuItems.map((item) => {
          if (item.submenu) {
            const isOpen = openMenus.includes(item.title);
            const hasActiveChild = item.submenu.some(sub => isActive(sub.href));

            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={() => toggleMenu(item.title)}
              >
                <CollapsibleTrigger className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  hasActiveChild && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    isOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-1 space-y-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.href}
                      to={subitem.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive(subitem.href) && "bg-sidebar-primary text-sidebar-primary-foreground"
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
                isActive(item.href) && "bg-sidebar-primary text-sidebar-primary-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin Desa</p>
            <p className="text-xs text-sidebar-foreground/70">Operator</p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
