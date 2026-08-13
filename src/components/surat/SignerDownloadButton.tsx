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

interface SignerDownloadButtonProps {
  /** Dipanggil dengan penandatangan yang dipilih; namaManual hanya terisi untuk opsi "An Lurah". */
  onSelect: (penandatangan: Penandatangan, namaManual?: string) => void;
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

  const handleConfirmManual = () => {
    onSelect("an_lurah", namaManual.trim() || undefined);
    setManualDialogOpen(false);
    setNamaManual("");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={disabled || isLoading} className={className}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : icon}
            {label}
            <ChevronDown className="w-3.5 h-3.5 ml-1.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Penandatangan Surat
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSelect("lurah")}>Lurah</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect("carik")}>Carik</DropdownMenuItem>
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
            <Button onClick={handleConfirmManual}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
