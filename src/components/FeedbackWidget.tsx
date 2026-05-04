import { useState } from "react";
import { MessageSquarePlus, X, Star, Send, Loader2, Bug, Lightbulb, SmilePlus } from "lucide-react";
import { toast } from "sonner";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwKJGrhm5KIRy2Gu8_YPHUYZ7jS9wJsrj2OEZI9IKaZ3nelUnxERlxNcOYlLcz5TigYpA/exec";

type TipeFeedback = "bug" | "fitur" | "kepuasan";

const TIPE_OPTIONS: { value: TipeFeedback; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "bug",     label: "Laporkan Bug",   icon: <Bug className="w-4 h-4" />,        desc: "Ada yang tidak berfungsi" },
  { value: "fitur",   label: "Saran Fitur",    icon: <Lightbulb className="w-4 h-4" />,  desc: "Ide untuk fitur baru" },
  { value: "kepuasan",label: "Penilaian",      icon: <SmilePlus className="w-4 h-4" />,  desc: "Beri nilai sistem ini" },
];

export const FeedbackWidget = () => {
  const [open, setOpen]           = useState(false);
  const [tipe, setTipe]           = useState<TipeFeedback>("bug");
  const [rating, setRating]       = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [nama, setNama]           = useState("");
  const [judul, setJudul]         = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tipe !== "kepuasan" && !judul.trim()) {
      toast.error("Judul tidak boleh kosong.");
      return;
    }
    if (tipe === "kepuasan" && rating === 0) {
      toast.error("Pilih rating terlebih dahulu.");
      return;
    }

    setIsSending(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script tidak support CORS biasa
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipe,
          rating:    tipe === "kepuasan" ? rating : "-",
          nama:      nama.trim() || "Anonim",
          halaman:   window.location.href,
          judul:     judul.trim(),
          deskripsi: deskripsi.trim(),
        }),
      });

      toast.success("Terima kasih! Feedback kamu sudah terkirim.");
      handleClose();
    } catch {
      toast.error("Gagal mengirim feedback. Coba lagi.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTipe("bug");
    setRating(0);
    setHoverRating(0);
    setNama("");
    setJudul("");
    setDeskripsi("");
  };

  return (
    <>
      {/* Tombol floating */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-medium"
      >
        <MessageSquarePlus className="w-4 h-4" />
        Laporkan Masalah
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-semibold text-base">Kirim Feedback</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bantu kami tingkatkan sistem ini
                </p>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Pilih tipe */}
              <div className="grid grid-cols-3 gap-2">
                {TIPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTipe(opt.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                      tipe === opt.value
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border hover:border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Rating — hanya muncul jika tipe kepuasan */}
              {tipe === "kepuasan" && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Seberapa puas kamu dengan sistem ini?</p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"][rating]}
                    </p>
                  )}
                </div>
              )}

              {/* Nama (opsional) */}
              <div>
                <label className="text-xs text-muted-foreground">Nama (opsional)</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama kamu"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Judul */}
              {tipe !== "kepuasan" && (
                <div>
                  <label className="text-xs text-muted-foreground">
                    {tipe === "bug" ? "Apa yang bermasalah? *" : "Saran fitur apa? *"}
                  </label>
                  <input
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder={tipe === "bug" ? "cth: Tombol download PDF tidak muncul" : "cth: Export data ke Excel per pedukuhan"}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              )}

              {/* Deskripsi */}
              <div>
                <label className="text-xs text-muted-foreground">
                  {tipe === "kepuasan" ? "Komentar tambahan (opsional)" : "Detail lebih lanjut (opsional)"}
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder={
                    tipe === "bug"
                      ? "Jelaskan langkah-langkah yang dilakukan sebelum error..."
                      : tipe === "fitur"
                      ? "Jelaskan lebih detail fitur yang diinginkan..."
                      : "Ada yang ingin disampaikan?"
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                  <><Send className="w-4 h-4" /> Kirim Feedback</>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Feedback dikirim langsung ke tim pengembang 🙏
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};