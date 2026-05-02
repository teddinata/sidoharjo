import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Loader2 } from "lucide-react";
import { registerApi, RegisterItem } from "@/lib/api";

function formatTanggal(str: string) {
  // str bisa "26/04/2026" atau "2026-04-26"
  if (!str) return "-";
  const d = str.includes("/")
    ? new Date(str.split("/").reverse().join("-"))
    : new Date(str);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function RecentActivity() {
  const [items, setItems] = useState<RegisterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const dari = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const sampai = today.toISOString().slice(0, 10);

    registerApi
      .list({ dari, sampai, per_page: 5, page: 1 })
      .then(({ data }) => setItems(data.data))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Aktivitas Terbaru</CardTitle>
          <p className="text-sm text-muted-foreground">Surat yang baru diterbitkan bulan ini</p>
        </div>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Belum ada surat bulan ini.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-sm truncate">{item.nama_pemohon}</p>
                  <Badge variant="default" className="text-xs bg-emerald-500/15 text-emerald-600 border-emerald-500/30 flex-shrink-0">
                    Terbit
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{item.jenis_pelayanan}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatTanggal(item.tanggal)} · {item.petugas}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
