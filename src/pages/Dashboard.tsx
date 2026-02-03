import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { MonthlyChart, CategoryChart } from "@/components/dashboard/DashboardCharts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { FileText, Users, Calendar, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang di Sistem Pelayanan Digital Desa Sidoharjo</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Surat Hari Ini"
            value={3}
            subtitle="2 selesai, 1 draft"
            icon={FileText}
            variant="primary"
          />
          <StatCard
            title="Surat Bulan Ini"
            value={45}
            icon={Calendar}
            trend={{ value: 18, label: "dari bulan lalu" }}
          />
          <StatCard
            title="Total Tahun Ini"
            value={252}
            icon={TrendingUp}
            trend={{ value: 12, label: "dari tahun lalu" }}
          />
          <StatCard
            title="Penduduk Terdaftar"
            value="3.247"
            subtitle="Data terakhir diperbarui"
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

        {/* Recent Activity - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          
          {/* Info Card */}
          <div className="rounded-xl bg-gradient-to-br from-primary to-navy-light p-6 text-primary-foreground">
            <h3 className="text-lg font-semibold mb-2">Desa Sidoharjo</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Kecamatan Galur, Kabupaten Kulon Progo<br />
              Daerah Istimewa Yogyakarta
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-primary-foreground/60">Kepala Desa</p>
                <p className="font-medium">H. Supriyanto, S.Pd</p>
              </div>
              <div>
                <p className="text-primary-foreground/60">Sekretaris Desa</p>
                <p className="font-medium">Tri Wahyuni, S.E</p>
              </div>
              <div>
                <p className="text-primary-foreground/60">Jumlah Padukuhan</p>
                <p className="font-medium">5 Padukuhan</p>
              </div>
              <div>
                <p className="text-primary-foreground/60">Luas Wilayah</p>
                <p className="font-medium">8,5 km²</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
