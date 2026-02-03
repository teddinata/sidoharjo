import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockSurat, getJenisSuratInfo, formatTanggalSingkat, formatWaktu } from "@/data/mockData";
import { FileText, Clock } from "lucide-react";

export function RecentActivity() {
  const recentSurat = mockSurat.slice(-5).reverse();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Aktivitas Terbaru</CardTitle>
          <p className="text-sm text-muted-foreground">Surat yang baru dibuat</p>
        </div>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSurat.map((surat) => {
          const jenisInfo = getJenisSuratInfo(surat.jenisSurat);
          return (
            <div 
              key={surat.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{surat.pemohon.nama}</p>
                  <Badge 
                    variant={surat.status === "selesai" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {surat.status === "selesai" ? "Selesai" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {jenisInfo?.nama}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTanggalSingkat(surat.tanggal)} • {formatWaktu(surat.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
