import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";
import { ChevronRight, Download, Printer, Calendar, TrendingUp, FileText, Users } from "lucide-react";
import { useState } from "react";

const monthlyComparison = [
  { bulan: "Jan", tahunIni: 45, tahunLalu: 38 },
  { bulan: "Feb", tahunIni: 52, tahunLalu: 42 },
  { bulan: "Mar", tahunIni: 0, tahunLalu: 48 },
  { bulan: "Apr", tahunIni: 0, tahunLalu: 35 },
  { bulan: "Mei", tahunIni: 0, tahunLalu: 40 },
  { bulan: "Jun", tahunIni: 0, tahunLalu: 45 },
  { bulan: "Jul", tahunIni: 0, tahunLalu: 38 },
  { bulan: "Agt", tahunIni: 0, tahunLalu: 52 },
  { bulan: "Sep", tahunIni: 0, tahunLalu: 40 },
  { bulan: "Okt", tahunIni: 0, tahunLalu: 35 },
  { bulan: "Nov", tahunIni: 0, tahunLalu: 42 },
  { bulan: "Des", tahunIni: 0, tahunLalu: 38 },
];

const categoryData = [
  { name: "Domisili", value: 120, color: "hsl(222, 47%, 20%)" },
  { name: "SKTM", value: 85, color: "hsl(45, 93%, 47%)" },
  { name: "SKU", value: 65, color: "hsl(199, 89%, 48%)" },
  { name: "Penghasilan", value: 45, color: "hsl(142, 76%, 36%)" },
  { name: "SKCK", value: 30, color: "hsl(280, 65%, 60%)" },
  { name: "Lainnya", value: 25, color: "hsl(215, 16%, 47%)" },
];

const padukuhanData = [
  { padukuhan: "Sidoharjo", total: 85 },
  { padukuhan: "Kebonrejo", total: 72 },
  { padukuhan: "Sumberagung", total: 68 },
  { padukuhan: "Kalibening", total: 55 },
  { padukuhan: "Tegalsari", total: 45 },
];

const Laporan = () => {
  const [periode, setPeriode] = useState("2026");

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Laporan</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Laporan & Statistik</h1>
              <p className="text-muted-foreground">Analisis data pelayanan surat desa</p>
            </div>
            <div className="flex gap-2">
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger className="w-[120px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <Printer className="w-4 h-4 mr-2" />
                Cetak Laporan
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Total Surat {periode}</p>
                  <p className="text-2xl font-bold">252</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata/Bulan</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-info" />
                <div>
                  <p className="text-sm text-muted-foreground">Bulan Tersibuk</p>
                  <p className="text-2xl font-bold">Agustus</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pemohon</p>
                  <p className="text-2xl font-bold">198</p>
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
              <p className="text-sm text-muted-foreground">{periode} vs {parseInt(periode) - 1}</p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tahunIni" 
                      stroke="hsl(222, 47%, 20%)" 
                      strokeWidth={2}
                      name={periode}
                      dot={{ fill: "hsl(222, 47%, 20%)" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tahunLalu" 
                      stroke="hsl(215, 16%, 47%)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={String(parseInt(periode) - 1)}
                      dot={{ fill: "hsl(215, 16%, 47%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribusi Jenis Surat</CardTitle>
              <p className="text-sm text-muted-foreground">Tahun {periode}</p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Padukuhan Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistik Per Padukuhan</CardTitle>
            <p className="text-sm text-muted-foreground">Jumlah surat berdasarkan wilayah</p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={padukuhanData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="padukuhan" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(45, 93%, 47%)" 
                    radius={[0, 4, 4, 0]}
                    name="Total Surat"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Laporan;
