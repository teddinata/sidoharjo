import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight, FileText, Download, Save, Search,
  CheckCircle2, XCircle, Loader2, AlertCircle, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useLookupNik } from "@/hooks/useLookupNik";
import { suratApi, jenisSuratApi, PendudukDetail, JenisSuratDetail } from "@/lib/api";
import { PADUKUHAN_LIST } from "@/types/surat";

// ── Komponen utama ─────────────────────────────────────────────────────────────
const BuatSurat = () => {
  const { jenis: kode } = useParams<{ jenis: string }>();
  const navigate = useNavigate();

  // Jenis surat dari API
  const [jenisSurat, setJenisSurat] = useState<JenisSuratDetail | null>(null);
  const [isLoadingJenis, setIsLoadingJenis] = useState(true);

  // NIK lookup
  const [nikInput, setNikInput] = useState("");
  const { status: nikStatus, penduduk, errorMessage: nikError, lookup, reset: resetLookup } = useLookupNik();

  // data_tambahan — field dinamis dari fields_tambahan jenis surat
  const [dataTambahan, setDataTambahan] = useState<Record<string, string>>({});

  // State setelah simpan
  const [isSaving, setIsSaving] = useState(false);
  const [langsungTerbit, setLangsungTerbit] = useState(true);
  const [savedSurat, setSavedSurat] = useState<{ id: number; nomor: string | null; status: string } | null>(null);
  const [isDownloading, setIsDownloading] = useState<"pdf" | "docx" | null>(null);

  // Load detail jenis surat dari /api/jenis-surat/{kode}
  useEffect(() => {
    if (!kode) return;
    setIsLoadingJenis(true);
    jenisSuratApi.get(kode)
      .then(({ data }) => setJenisSurat(data.data))
      .catch(() => toast.error("Gagal memuat detail jenis surat."))
      .finally(() => setIsLoadingJenis(false));
  }, [kode]);

  // Init data_tambahan saat jenis surat selesai di-load
  useEffect(() => {
    if (jenisSurat?.fields_tambahan) {
      const init: Record<string, string> = {};
      jenisSurat.fields_tambahan.forEach((f) => { init[f.key] = ""; });
      setDataTambahan(init);
    }
  }, [jenisSurat]);

  const handleNikLookup = async () => {
    if (nikInput.length < 16) { toast.error("NIK harus 16 digit."); return; }
    await lookup(nikInput);
  };

  const handleReset = () => {
    setNikInput("");
    resetLookup();
    setSavedSurat(null);
    setDataTambahan({});
    if (jenisSurat?.fields_tambahan) {
      const init: Record<string, string> = {};
      jenisSurat.fields_tambahan.forEach((f) => { init[f.key] = ""; });
      setDataTambahan(init);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penduduk || !kode) return;

    // Validasi required fields
    const missing = jenisSurat?.fields_tambahan
      .filter((f) => f.required && !dataTambahan[f.key]?.trim())
      .map((f) => f.label);
    if (missing?.length) {
      toast.error(`Isi field berikut: ${missing.join(", ")}`);
      return;
    }

    setIsSaving(true);
    try {
      const cleanedDataTambahan = { ...dataTambahan };
      jenisSurat?.fields_tambahan.forEach((f) => {
        if (f.type === "number" && cleanedDataTambahan[f.key]) {
          cleanedDataTambahan[f.key] = cleanedDataTambahan[f.key].toString().replace(/\D/g, "");
        }
      });

      const { data } = await suratApi.create({
        penduduk_id: penduduk.id,
        jenis_surat_kode: kode,
        langsung_terbit: langsungTerbit,
        data_tambahan: cleanedDataTambahan,
      });

      setSavedSurat({
        id: data.data.id,
        nomor: data.data.nomor_surat,
        status: data.data.status,
      });
      toast.success(data.message);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Gagal menyimpan surat. Silakan coba lagi.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = async (format: "pdf" | "docx") => {
    if (!savedSurat) return;
    setIsDownloading(format);
    try {
      const safeSuratName = jenisSurat?.nama.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_") || "Surat";
      const safePendudukName = penduduk?.nama_lengkap.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_") || "Penduduk";
      
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}_${String(today.getMonth() + 1).padStart(2, '0')}_${today.getFullYear()}`;
      
      const customFilename = `${safeSuratName}_${safePendudukName}_${dateStr}.${format}`;
      
      if (format === "pdf") await suratApi.downloadPdf(savedSurat.id, customFilename);
      else await suratApi.downloadDocx(savedSurat.id, customFilename);
      toast.success(`${format.toUpperCase()} berhasil diunduh.`);
    } catch {
      toast.error(`Gagal mengunduh ${format.toUpperCase()}.`);
    } finally {
      setIsDownloading(null);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoadingJenis) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!jenisSurat) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Jenis surat tidak ditemukan.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
        </div>
      </AppLayout>
    );
  }

  const showForm = nikStatus === "found" && !!penduduk;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Buat Surat</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{jenisSurat.nama}</span>
          </div>
          <h1 className="text-2xl font-bold">{jenisSurat.nama}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kode: <span className="font-mono">{jenisSurat.kode}</span>
            &nbsp;·&nbsp; Kategori: {jenisSurat.kategori}
            &nbsp;·&nbsp; Nomor format: {jenisSurat.nomor_format}
          </p>
        </div>

        {/* Banner sukses */}
        {savedSurat && (
          <div className="rounded-xl border border-success/30 bg-success/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">
                  {savedSurat.status === "terbit" ? "Surat berhasil diterbitkan!" : "Surat tersimpan sebagai draft."}
                </p>
                {savedSurat.nomor && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Nomor: <span className="font-mono font-medium text-foreground">{savedSurat.nomor}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {savedSurat.status === "terbit" && (
                <>
                  <Button size="sm" onClick={() => handleDownload("pdf")} disabled={!!isDownloading}>
                    {isDownloading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload("docx")} disabled={!!isDownloading}>
                    {isDownloading === "docx" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    DOCX
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={handleReset}>
                Buat Surat Baru
              </Button>
            </div>
          </div>
        )}

        {/* Step 1 — Cari NIK */}
        {!savedSurat && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                Cari Penduduk (NIK)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Masukkan 16 digit NIK lalu tekan Enter"
                    value={nikInput}
                    onChange={(e) => setNikInput(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleNikLookup())}
                    maxLength={16}
                    disabled={nikStatus === "loading"}
                    className="font-mono pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {nikInput.length}/16
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={handleNikLookup}
                  disabled={nikInput.length < 16 || nikStatus === "loading"}
                >
                  {nikStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="ml-2">Cari</span>
                </Button>
              </div>

              <div className="mt-3">
                {nikStatus === "loading" && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Mencari...
                  </p>
                )}
                {nikStatus === "found" && penduduk && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">
                        {penduduk.nama_lengkap}
                        <span className="text-muted-foreground font-normal ml-1">
                          ({penduduk.umur} th · {penduduk.pedukuhan})
                        </span>
                      </span>
                    </div>
                    <button type="button" onClick={handleReset} className="text-xs text-muted-foreground hover:text-destructive">
                      Ganti
                    </button>
                  </div>
                )}
                {(nikStatus === "not_found" || nikStatus === "error") && (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">{nikError}</span>
                  </div>
                )}
                {nikStatus === "idle" && (
                  <p className="text-xs text-muted-foreground">
                    Penduduk harus terdaftar di database. Surat tidak bisa dibuat secara manual.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Ringkasan data penduduk + form tambahan */}
        {showForm && !savedSurat && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                <h2 className="font-semibold text-base">Data Pemohon</h2>
                <Badge variant="secondary" className="text-xs">Dari database</Badge>
              </div>

              {/* Ringkasan penduduk — read only, tidak bisa diubah */}
              <Card className="bg-muted/30">
                <CardContent className="pt-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                    {[
                      { label: "NIK", value: penduduk!.nik, mono: true },
                      { label: "Nama Lengkap", value: penduduk!.nama_lengkap },
                      { label: "Tempat, Tgl Lahir", value: `${penduduk!.tempat_lahir}, ${penduduk!.tanggal_lahir_format}` },
                      { label: "Jenis Kelamin", value: penduduk!.jenis_kelamin },
                      { label: "Agama", value: penduduk!.agama },
                      { label: "Status Perkawinan", value: penduduk!.status_perkawinan },
                      { label: "Pekerjaan", value: penduduk!.pekerjaan },
                      { label: "Pedukuhan", value: penduduk!.pedukuhan },
                      { label: "RT / RW", value: `${penduduk!.rt} / ${penduduk!.rw}` },
                      { label: "Alamat", value: penduduk!.alamat_lengkap, span: true },
                    ].map((item) => (
                      <div key={item.label} className={item.span ? "col-span-2 sm:col-span-3" : ""}>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={`font-medium ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 — Field dinamis dari jenis surat */}
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                <h2 className="font-semibold text-base">Keterangan Surat</h2>
              </div>

              <Card>
                <CardContent className="pt-5 space-y-4">
                  {jenisSurat.fields_tambahan.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Jenis surat ini tidak memerlukan keterangan tambahan.
                    </p>
                  ) : (
                    jenisSurat.fields_tambahan.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>
                          {field.label} {field.required && "*"}
                        </Label>
                        {field.type === "select" ? (
                          <Select
                            value={dataTambahan[field.key] ?? ""}
                            onValueChange={(v) =>
                              setDataTambahan((prev) => ({ ...prev, [field.key]: v }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={`Pilih ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {(field.options || PADUKUHAN_LIST).map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === "date" ? (
                          <Input
                            id={field.key}
                            type="date"
                            value={dataTambahan[field.key] ?? ""}
                            onChange={(e) =>
                              setDataTambahan((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            className="mt-1"
                            required={field.required}
                          />
                        ) : field.type === "number" ? (
                          <Input
                            id={field.key}
                            type="text"
                            inputMode="numeric"
                            value={dataTambahan[field.key] ?? ""}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, "");
                              const formatted = rawValue ? new Intl.NumberFormat("id-ID").format(Number(rawValue)) : "";
                              setDataTambahan((prev) => ({ ...prev, [field.key]: formatted }));
                            }}
                            className="mt-1"
                            required={field.required}
                          />
                        ) : (
                          <Input
                            id={field.key}
                            type="text"
                            value={dataTambahan[field.key] ?? ""}
                            onChange={(e) =>
                              setDataTambahan((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            className="mt-1"
                            required={field.required}
                          />
                        )}
                      </div>
                    ))
                  )}

                  {/* Opsi terbit/draft */}
                  <div className="pt-2 border-t border-border">
                    <Label className="text-sm font-medium">Mode Simpan</Label>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setLangsungTerbit(true)}
                        className={`flex-1 rounded-lg border p-3 text-sm text-left transition-colors ${
                          langsungTerbit
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <p className="font-medium">Terbitkan Sekarang</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Nomor surat langsung digenerate</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLangsungTerbit(false)}
                        className={`flex-1 rounded-lg border p-3 text-sm text-left transition-colors ${
                          !langsungTerbit
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <p className="font-medium">Simpan sebagai Draft</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Nomor belum digenerate</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving || (jenisSurat.fields_tambahan.some(f => f.required && !dataTambahan[f.key]?.trim()))} 
                  className="min-w-36"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Menyimpan...</>
                  ) : langsungTerbit ? (
                    <><FileText className="w-4 h-4 mr-2" />Terbitkan Surat</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Simpan Draft</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default BuatSurat;