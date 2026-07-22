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
import { ChevronDown, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Penandatangan } from "@/lib/api";

interface SignerDownloadButtonProps {
  /** Dipanggil dengan "lurah" atau "carik" saat salah satu opsi dipilih. */
  onSelect: (penandatangan: Penandatangan) => void;
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
 * (Lurah / Carik) yang akan tercetak pada surat.
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
  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
