import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { registerApi, RegisterRekap } from "@/lib/api";

const COLORS = [
  "hsl(222, 47%, 20%)", "hsl(45, 93%, 47%)", "hsl(199, 89%, 48%)",
  "hsl(142, 76%, 36%)", "hsl(280, 65%, 60%)", "hsl(215, 16%, 47%)",
  "hsl(0, 72%, 51%)", "hsl(25, 95%, 53%)",
];

function ChartLoader() {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function MonthlyChart() {
  const [data, setData] = useState<{ name: string; jumlah: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tahun = new Date().getFullYear();
    registerApi.rekap({ tahun })
      .then(({ data: res }) => {
        const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const mapped = res.per_bulan.map((b) => ({
          name: BULAN[parseInt(b.bulan) - 1] ?? b.bulan,
          jumlah: b.jumlah,
        }));
        setData(mapped);
      })
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Tren Pembuatan Surat</CardTitle>
        <p className="text-sm text-muted-foreground">Tahun {new Date().getFullYear()}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? <ChartLoader /> : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="jumlah" fill="hsl(222, 47%, 20%)" radius={[4, 4, 0, 0]} name="Jumlah Surat" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CategoryChart() {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tahun = new Date().getFullYear();
    registerApi.rekap({ tahun })
      .then(({ data: res }) => {
        const mapped = res.per_jenis.slice(0, 8).map((j, i) => ({
          name: j.jenis.replace("Surat Keterangan ", "").replace("Surat Pengantar ", ""),
          value: j.jumlah,
          color: COLORS[i % COLORS.length],
        }));
        setData(mapped);
      })
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  const max = data[0]?.value ?? 1;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Jenis Surat Terbanyak</CardTitle>
        <p className="text-sm text-muted-foreground">Tahun {new Date().getFullYear()}</p>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? <ChartLoader /> : (
          <ol className="space-y-2.5">
            {data.map((entry, i) => (
              <li key={i} className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-muted-foreground w-4 shrink-0 text-right">{i + 1}</span>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-medium truncate">{entry.name}</span>
                    <span className="text-xs font-bold tabular-nums shrink-0">{entry.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(entry.value / max) * 100}%`, backgroundColor: entry.color }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

/** Hook untuk dipakai di Dashboard dan Laporan */
export function useRekapData(tahun: number) {
  const [rekap, setRekap] = useState<RegisterRekap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    registerApi.rekap({ tahun })
      .then(({ data }) => setRekap(data))
      .catch(() => setRekap(null))
      .finally(() => setIsLoading(false));
  }, [tahun]);

  return { rekap, isLoading };
}
