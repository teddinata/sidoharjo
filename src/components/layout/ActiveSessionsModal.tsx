import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Monitor, ShieldOff } from "lucide-react";
import { authApi, SessionItem } from "@/lib/api";
import { toast } from "sonner";

interface ActiveSessionsModalProps {
  open: boolean;
  onClose: () => void;
}

function formatWaktu(tgl: string | null): string {
  if (!tgl) return "-";
  return new Date(tgl).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActiveSessionsModal({ open, onClose }: ActiveSessionsModalProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const loadSessions = () => {
    setIsLoading(true);
    authApi.sessions()
      .then(({ data }) => setSessions(data.data))
      .catch(() => toast.error("Gagal memuat daftar sesi login."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (open) loadSessions();
  }, [open]);

  const handleRevoke = async (session: SessionItem) => {
    if (!confirm(`Cabut sesi login "${session.device}"? Perangkat itu akan otomatis logout.`)) return;
    setRevokingId(session.id);
    try {
      await authApi.revokeSession(session.id);
      toast.success("Sesi berhasil dicabut.");
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    } catch {
      toast.error("Gagal mencabut sesi.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sesi Login Aktif</DialogTitle>
          <DialogDescription>
            Maksimal 3 sesi aktif bersamaan. Cabut sesi yang mencurigakan atau tidak Anda kenali.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Monitor className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{session.device}</p>
                      {session.is_current && (
                        <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-xs">
                          Sesi ini
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.ip_address ?? "IP tidak diketahui"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Login: {formatWaktu(session.created_at)}
                      {session.last_used_at && ` · Aktif terakhir: ${formatWaktu(session.last_used_at)}`}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(session)}
                    disabled={revokingId === session.id}
                    className="gap-1.5 text-destructive hover:text-destructive border-destructive/30 shrink-0"
                  >
                    {revokingId === session.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldOff className="w-3.5 h-3.5" />
                    )}
                    Cabut
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
