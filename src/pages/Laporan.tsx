import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from "recharts";
import { ChevronRight, Download, Calendar, TrendingUp, FileText, Users, Loader2, MapPin } from "lucide-react";
import { registerApi, RegisterRekap } from "@/lib/api";

const BULAN_LABEL = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
const COLORS = [
  "hsl(222, 47%, 20%)", "hsl(45, 93%, 47%)", "hsl(199, 89%, 48%)",
  "hsl(142, 76%, 36%)", "hsl(280, 65%, 60%)", "hsl(215, 16%, 47%)",
  "hsl(0, 72%, 51%)", "hsl(25, 95%, 53%)",
];

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(String);

const Laporan = () => {
  const [tahun, setTahun] = useState(String(currentYear));
  const [tahunLalu, setTahunLalu] = useState<RegisterRekap | null>(null);
  const [rekap, setRekap] = useState<RegisterRekap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const t = parseInt(tahun);
    Promise.all([
      registerApi.rekap({ tahun: t }),
      registerApi.rekap({ tahun: t - 1 }),
    ])
      .then(([r1, r2]) => {
        setRekap(r1.data);
        setTahunLalu(r2.data);
      })
      .catch(() => {
        setRekap(null);
        setTahunLalu(null);
      })
      .finally(() => setIsLoading(false));
  }, [tahun]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await registerApi.export({ tahun: parseInt(tahun) });
    } catch {
      // handled by download
    } finally {
      setIsExporting(false);
    }
  };

  // Gabungkan data per bulan tahun ini & tahun lalu
  const monthlyComparison = BULAN_LABEL.map((label, i) => {
    const bulanStr = String(i + 1);
    const ini = rekap?.per_bulan.find((b) => b.bulan === bulanStr)?.jumlah ?? 0;
    const lalu = tahunLalu?.per_bulan.find((b) => b.bulan === bulanStr)?.jumlah ?? 0;
    return { bulan: label, tahunIni: ini, tahunLalu: lalu };
  });

  const pieData = (rekap?.per_jenis ?? []).slice(0, 8).map((j, i) => ({
    name: j.jenis.replace("Surat Keterangan ", "SK ").replace("Surat Pengantar ", "SP "),
    value: j.jumlah,
    color: COLORS[i % COLORS.length],
  }));

  const padukuhanData = (rekap?.per_pedukuhan ?? []).map((p) => ({
    padukuhan: p.pedukuhan,
    total: p.jumlah,
  }));

  const rataPerBulan = rekap ? Math.round(rekap.total / 12) : 0;
  const bulanTersibuk = rekap?.per_bulan.reduce(
    (max, b) => (b.jumlah > max.jumlah ? b : max),
    { bulan: "0", jumlah: 0 }
  );
  const bulanTersibukLabel = bulanTersibuk ? BULAN_LABEL[parseInt(bulanTersibuk.bulan) - 1] ?? "-" : "-";

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Laporan</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Laporan & Statistik</h1>
              <p className="text-muted-foreground text-sm">Analisis data pelayanan surat desa</p>
            </div>
            <div className="flex gap-2">
              <Select value={tahun} onValueChange={setTahun}>
                <SelectTrigger className="w-[120px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading}>
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 opacity-80" />
                    <div>
                      <p className="text-sm opacity-80">Total Surat {tahun}</p>
                      <p className="text-3xl font-bold">{(rekap?.total ?? 0).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rata-rata/Bulan</p>
                      <p className="text-3xl font-bold">{rataPerBulan}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bulan Tersibuk</p>
                      <p className="text-3xl font-bold">{bulanTersibukLabel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-violet-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Jenis Surat</p>
                      <p className="text-3xl font-bold">{rekap?.per_jenis.length ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Perbandingan Tahun</CardTitle>
                  <p className="text-sm text-muted-foreground">{tahun} vs {parseInt(tahun) - 1}</p>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Legend />
                        <Line type="monotone" dataKey="tahunIni" stroke="hsl(222, 47%, 20%)" strokeWidth={2} name={tahun} dot={{ fill: "hsl(222, 47%, 20%)" }} />
                        <Line type="monotone" dataKey="tahunLalu" stroke="hsl(215, 16%, 47%)" strokeWidth={2} strokeDasharray="5 5" name={String(parseInt(tahun) - 1)} dot={{ fill: "hsl(215, 16%, 47%)" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Pie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribusi Jenis Surat</CardTitle>
                  <p className="text-sm text-muted-foreground">Tahun {tahun}</p>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Per Pedukuhan */}
            {padukuhanData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    Statistik Per Pedukuhan
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Jumlah surat berdasarkan wilayah — Tahun {tahun}</p>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={padukuhanData} layout="vertical" margin={{ top: 10, right: 30, left: 90, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="padukuhan" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Bar dataKey="total" fill="hsl(45, 93%, 47%)" radius={[0, 4, 4, 0]} name="Total Surat" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabel per jenis */}
            {rekap && rekap.per_jenis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rincian Per Jenis Surat</CardTitle>
                  <p className="text-sm text-muted-foreground">Tahun {tahun}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rekap.per_jenis.map((j, i) => {
                      const pct = rekap.total > 0 ? (j.jumlah / rekap.total) * 100 : 0;
                      return (
                        <div key={j.jenis} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <p className="text-sm flex-1 truncate">{j.jenis}</p>
                          <p className="text-sm font-semibold w-10 text-right">{j.jumlah}</p>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                          <p className="text-xs text-muted-foreground w-10 text-right">{pct.toFixed(1)}%</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Laporan;
