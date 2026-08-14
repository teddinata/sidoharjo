import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Penandatangan } from "@/lib/api";
import { PdfPreviewDialog } from "@/components/surat/PdfPreviewDialog";
import { toast } from "sonner";

interface SignerDownloadButtonProps {
  /** Dipanggil dengan penandatangan yang dipilih; namaManual hanya terisi untuk opsi "An Lurah". */
  onSelect: (penandatangan: Penandatangan, namaManual?: string) => void;
  /**
   * Kalau diisi: setelah penandatangan dipilih, file diambil lewat fungsi ini lalu
   * ditampilkan dulu di dialog preview (bukan langsung diunduh) — tombol "Download"
   * di dalam dialog itu baru benar-benar menyimpan filenya. Hanya masuk akal untuk
   * PDF (browser tidak bisa preview DOCX secara native); kalau tidak diisi, memilih
   * penandatangan langsung memanggil onSelect seperti biasa.
   */
  onFetchBlob?: (penandatangan: Penandatangan, namaManual?: string) => Promise<{ blob: Blob; filename: string }>;
  isLoading?: boolean;
  label: string;
  icon: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  disabled?: boolean;
  className?: string;
}

/**
 * Tombol download bergaya split-button: klik membuka pilihan penandatangan
 * (Lurah / Carik / An Lurah) yang akan tercetak pada surat.
 */
export function SignerDownloadButton({
  onSelect,
  onFetchBlob,
  isLoading,
  label,
  icon,
  variant,
  size,
  disabled,
  className,
}: SignerDownloadButtonProps) {
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [namaManual, setNamaManual] = useState("");
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewFilename, setPreviewFilename] = useState("");

  const handlePick = async (penandatangan: Penandatangan, nama?: string) => {
    if (!onFetchBlob) {
      onSelect(penandatangan, nama);
      return;
    }
    setIsFetchingPreview(true);
    try {
      const { blob, filename } = await onFetchBlob(penandatangan, nama);
      setPreviewBlob(blob);
      setPreviewFilename(filename);
      setPreviewOpen(true);
    } catch {
      toast.error("Gagal memuat preview surat.");
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleConfirmManual = () => {
    setManualDialogOpen(false);
    const nama = namaManual.trim() || undefined;
    setNamaManual("");
    handlePick("an_lurah", nama);
  };

  const busy = isLoading || isFetchingPreview;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={disabled || busy} className={className}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : icon}
            {label}
            <ChevronDown className="w-3.5 h-3.5 ml-1.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Penandatangan Surat
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handlePick("lurah")}>Lurah</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePick("carik")}>Carik</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setManualDialogOpen(true)}>
            An Lurah (isi manual)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>An Lurah — Isi Nama Manual</DialogTitle>
            <DialogDescription>
              Jabatan akan tercetak "An Lurah". Nama boleh dikosongkan kalau mau diisi tulisan tangan setelah dicetak.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="nama-manual">Nama Penandatangan (opsional)</Label>
            <Input
              id="nama-manual"
              value={namaManual}
              onChange={(e) => setNamaManual(e.target.value)}
              placeholder="Kosongkan untuk diisi tulisan tangan"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualDialogOpen(false)}>Batal</Button>
            <Button onClick={handleConfirmManual}>Lanjut</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {onFetchBlob && (
        <PdfPreviewDialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          blob={previewBlob}
          filename={previewFilename}
        />
      )}
    </>
  );
}
