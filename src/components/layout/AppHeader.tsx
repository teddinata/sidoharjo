import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/surat/kependudukan": "Surat Kependudukan",
  "/surat/usaha": "Surat Usaha & Ekonomi",
  "/surat/lainnya": "Surat Lainnya",
  "/arsip": "Arsip Data",
  "/laporan": "Laporan & Statistik",
  "/penduduk": "Data Penduduk",
  "/pengaturan": "Pengaturan",
  "/users": "Manajemen User",
};

export function AppHeader() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Resolve page title — match exact first, then prefix
  const pageTitle = PAGE_TITLES[location.pathname]
    ?? Object.entries(PAGE_TITLES).find(([k]) => k !== "/" && location.pathname.startsWith(k))?.[1]
    ?? "Raharja";

  return (
    <header className="h-14 lg:h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between gap-3 flex-shrink-0">
      {/* Page title on mobile, search placeholder on desktop */}
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="font-semibold text-foreground truncate text-sm lg:text-base">
          {pageTitle}
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        {/* Online/Offline Status */}
        <Badge
          variant={isOnline ? "default" : "destructive"}
          className={`gap-1 text-xs ${isOnline ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15" : ""}`}
        >
          {isOnline ? (
            <><Wifi className="w-3 h-3" /><span className="hidden sm:inline">Online</span></>
          ) : (
            <><WifiOff className="w-3 h-3" /><span className="hidden sm:inline">Offline</span></>
          )}
        </Badge>

        {/* Date — hidden on small mobile */}
        <div className="hidden md:block text-sm text-muted-foreground whitespace-nowrap">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>
    </header>
  );
}
