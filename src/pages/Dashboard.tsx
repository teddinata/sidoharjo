import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { MonthlyChart, CategoryChart } from "@/components/dashboard/DashboardCharts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { FileText, Users, Calendar, TrendingUp } from "lucide-react";
import { registerApi, pendudukApi } from "@/lib/api";
import { settingsApi } from "@/lib/api";

const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth() + 1;

const Dashboard = () => {
  const [statHariIni, setStatHariIni] = useState<number | null>(null);
  const [statBulanIni, setStatBulanIni] = useState<number | null>(null);
  const [statTahunIni, setStatTahunIni] = useState<number | null>(null);
  const [statPenduduk, setStatPenduduk] = useState<number | null>(null);
  const [namaLurah, setNamaLurah] = useState("—");
  const [namaKelurahan, setNamaKelurahan] = useState("Desa Sidoharjo");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const bulanAwal = `${thisYear}-${String(thisMonth).padStart(2, "0")}-01`;

    // Hari ini
    registerApi.list({ dari: today, sampai: today, per_page: 5 })
      .then(({ data }) => setStatHariIni(data.meta.total))
      .catch(() => setStatHariIni(0));

    // Bulan ini
    registerApi.list({ dari: bulanAwal, sampai: today, per_page: 5 })
      .then(({ data }) => setStatBulanIni(data.meta.total))
      .catch(() => setStatBulanIni(0));

    // Tahun ini
    registerApi.rekap({ tahun: thisYear })
      .then(({ data }) => setStatTahunIni(data.total))
      .catch(() => setStatTahunIni(0));

    // Total penduduk
    pendudukApi.list({ per_page: 1 })
      .then(({ data }) => setStatPenduduk(data.meta.total))
      .catch(() => setStatPenduduk(null));

    // Settings (nama lurah, kelurahan)
    settingsApi.get()
      .then(({ data }) => {
        setNamaLurah(data.data.nama_lurah ?? "—");
        setNamaKelurahan(data.data.nama_kelurahan ?? "Desa Sidoharjo");
      })
      .catch(() => {});
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang di Sistem Pelayanan Digital {namaKelurahan}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Surat Hari Ini"
            value={statHariIni ?? "—"}
            subtitle="Total layanan hari ini"
            icon={FileText}
            variant="primary"
          />
          <StatCard
            title="Surat Bulan Ini"
            value={statBulanIni ?? "—"}
            icon={Calendar}
            subtitle={`Bulan ${new Date().toLocaleDateString("id-ID", { month: "long" })}`}
          />
          <StatCard
            title={`Total Tahun ${thisYear}`}
            value={statTahunIni ?? "—"}
            icon={TrendingUp}
            subtitle="Seluruh jenis surat"
          />
          <StatCard
            title="Penduduk Terdaftar"
            value={statPenduduk !== null ? statPenduduk.toLocaleString("id-ID") : "—"}
            subtitle="Warga aktif & nonaktif"
            icon={Users}
          />
        </div>

        {/* Quick Access */}
        <QuickAccess />

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MonthlyChart />
          <CategoryChart />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />

          {/* Info Card dari Settings */}
          <div className="rounded-xl bg-gradient-to-br from-primary to-navy-light p-6 text-primary-foreground">
            <h3 className="text-lg font-semibold mb-2">{namaKelurahan}</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Sistem Pelayanan Administrasi Digital
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-primary-foreground/60">Kepala Desa / Lurah</p>
                <p className="font-medium">{namaLurah}</p>
              </div>
              <div>
                <p className="text-primary-foreground/60">Tahun Berjalan</p>
                <p className="font-medium">{thisYear}</p>
              </div>
              <div>
                <p className="text-primary-foreground/60">Layanan Hari Ini</p>
                <p className="font-medium">{statHariIni ?? "..."} surat</p>
              </div>
              <div>
                <p className="text-primary-foreground/60">Layanan Bulan Ini</p>
                <p className="font-medium">{statBulanIni ?? "..."} surat</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
