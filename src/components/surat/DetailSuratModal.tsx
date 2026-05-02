import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2, FileText, User, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { suratApi } from "@/lib/api";
import { toast } from "sonner";
import { SuratItem } from "@/hooks/useSuratList";
import { useJenisSurat } from "@/hooks/useJenisSurat";

interface DetailSuratModalProps {
  surat: SuratItem | null;
  open: boolean;
  onClose: () => void;
}

function formatTanggal(tgl: string): string {
  if (!tgl) return "-";
  return new Date(tgl).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: SuratItem["status"] }) {
  const map = {
    selesai: { label: "Selesai", className: "bg-success/15 text-success border-success/30" },
    draft: { label: "Draft", className: "bg-secondary text-secondary-foreground" },
    dibatalkan: { label: "Dibatalkan", className: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

export function DetailSuratModal({ surat, open, onClose }: DetailSuratModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { flat: jenisSuratList } = useJenisSurat();

  if (!surat) return null;

  const jenisInfo = jenisSuratList.find((j) => j.kode === surat.jenis_surat);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await suratApi.downloadPdf(surat.id);
      toast.success("PDF berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DialogTitle className="text-lg">Detail Surat</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                {surat.nomor_surat}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={surat.status} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">

          {/* Info surat */}
          <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              Informasi Surat
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Jenis Surat</p>
                <p className="font-medium">{jenisInfo?.nama ?? surat.jenis_surat}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tanggal Dibuat</p>
                <p className="font-medium">{formatTanggal(surat.tanggal ?? surat.created_at)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Keperluan</p>
                <p className="font-medium">{surat.keperluan}</p>
              </div>
              {surat.keterangan && (
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Keterangan</p>
                  <p className="font-medium">{surat.keterangan}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Data pemohon */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="w-4 h-4" />
              Data Pemohon
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">NIK</p>
                <p className="font-mono font-medium">{surat.pemohon.nik}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Nama Lengkap</p>
                <p className="font-medium">{surat.pemohon.nama}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tempat, Tgl Lahir</p>
                <p className="font-medium">
                  {surat.pemohon.tempat_lahir}, {formatTanggal(surat.pemohon.tanggal_lahir)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Jenis Kelamin</p>
                <p className="font-medium">{surat.pemohon.jenis_kelamin}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Agama</p>
                <p className="font-medium">{surat.pemohon.agama}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Status Perkawinan</p>
                <p className="font-medium">{surat.pemohon.status_perkawinan}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Pekerjaan</p>
                <p className="font-medium">{surat.pemohon.pekerjaan}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Kewarganegaraan</p>
                <p className="font-medium">{surat.pemohon.kewarganegaraan}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Alamat */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="w-4 h-4" />
              Alamat
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Alamat Lengkap</p>
                <p className="font-medium">{surat.pemohon.alamat}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">RT / RW</p>
                <p className="font-medium">
                  {surat.pemohon.rt} / {surat.pemohon.rw}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Padukuhan</p>
                <p className="font-medium">{surat.pemohon.padukuhan}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
            {surat.status === "selesai" && (
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download PDF
              </Button>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}