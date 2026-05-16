import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Store, Shield, Pencil } from "lucide-react";

const suratTabs = [
  { label: "Kependudukan", icon: Home, href: "/surat/kependudukan" },
  { label: "Usaha & Ekonomi", icon: Store, href: "/surat/usaha" },
  { label: "Lainnya", icon: Shield, href: "/surat/lainnya" },
  { label: "Surat Kustom", icon: Pencil, href: "/surat/buat/CUSTOM" },
];

/**
 * Sub-navigation bar untuk halaman Buat Surat.
 * Tampil sebagai tab pill di semua ukuran layar,
 * sangat berguna di mobile karena sidebar submenu tidak terlihat.
 */
export function SuratSubNav() {
  const location = useLocation();

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
      {suratTabs.map((tab) => {
        const active = location.pathname === tab.href;
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
