import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { triggerBlobDownload } from "@/lib/api";

interface PdfPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  blob: Blob | null;
  filename: string;
}

/** Preview PDF inline (pakai renderer PDF bawaan browser) sebelum benar-benar diunduh. */
export function PdfPreviewDialog({ open, onClose, blob, filename }: PdfPreviewDialogProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[92vw] h-[88vh] flex flex-col p-4">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono truncate pr-6">{filename}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-border bg-muted">
          {objectUrl && (
            <iframe src={objectUrl} title="Preview surat" className="w-full h-full" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button
            onClick={() => blob && triggerBlobDownload(blob, filename)}
            className="gap-2"
          >
            <Download className="w-4 h-4" /> Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
