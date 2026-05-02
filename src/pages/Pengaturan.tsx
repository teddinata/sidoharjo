import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Settings, Save, Loader2, Upload, Trash2, Image, FileSignature,
  Building2, User, MapPin, Phone, Globe,
} from "lucide-react";
import { settingsApi, uploadApi, KalurahanSettings } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

export default function Pengaturan() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState<KalurahanSettings>({
    nama_kelurahan: "", nama_kapanewon: "", nama_kabupaten: "",
    nama_provinsi: "", nama_lengkap: "", nama_lurah: "", nip_lurah: "",
    alamat: "", kode_pos: "", telepon: "", email: "", website: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [ttdPreview, setTtdPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingTtd, setIsUploadingTtd] = useState(false);
  const [isDeletingTtd, setIsDeletingTtd] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);
  const ttdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    settingsApi.get().then(({ data }) => {
      const s = data.data;
      setForm(s);
      if (s.logo_path) setLogoPreview(`${API_BASE}/storage/${s.logo_path}`);
      if (s.ttd_lurah_path) setTtdPreview(`${API_BASE}/storage/${s.ttd_lurah_path}`);
    }).catch(() => {
      toast.error("Gagal memuat pengaturan.");
    }).finally(() => setIsLoading(false));
  }, []);

  const setField = (key: keyof KalurahanSettings, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update(form);
      toast.success("Pengaturan berhasil disimpan.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    setIsUploadingLogo(true);
    try {
      await uploadApi.logo(file);
      setLogoPreview(URL.createObjectURL(file));
      toast.success("Logo berhasil diunggah.");
    } catch {
      toast.error("Gagal mengunggah logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUploadTtd = async (file: File) => {
    setIsUploadingTtd(true);
    try {
      await uploadApi.ttdLurah(file);
      setTtdPreview(URL.createObjectURL(file));
      toast.success("Tanda tangan berhasil diunggah.");
    } catch {
      toast.error("Gagal mengunggah tanda tangan.");
    } finally {
      setIsUploadingTtd(false);
    }
  };

  const handleDeleteTtd = async () => {
    if (!confirm("Yakin ingin menghapus tanda tangan Lurah?")) return;
    setIsDeletingTtd(true);
    try {
      await uploadApi.deleteTtdLurah();
      setTtdPreview(null);
      toast.success("Tanda tangan berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus tanda tangan.");
    } finally {
      setIsDeletingTtd(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
              <p className="text-muted-foreground text-sm">Konfigurasi data Kalurahan dan identitas surat</p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Perubahan
            </Button>
          )}
        </div>

        {!isAdmin && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            Anda login sebagai <strong>Petugas</strong>. Hanya Admin yang dapat mengubah pengaturan ini.
          </div>
        )}

        {/* ── Identitas Kalurahan ────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5 text-primary" />
              Identitas Kalurahan
            </CardTitle>
            <CardDescription>Nama resmi yang muncul pada kop surat</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Kalurahan" id="nama_kel">
              <Input id="nama_kel" value={form.nama_kelurahan} onChange={(e) => setField("nama_kelurahan", e.target.value)} disabled={!isAdmin} />
            </FormField>
            <FormField label="Kapanewon (Kecamatan)" id="kapanewon">
              <Input id="kapanewon" value={form.nama_kapanewon} onChange={(e) => setField("nama_kapanewon", e.target.value)} disabled={!isAdmin} />
            </FormField>
            <FormField label="Kabupaten" id="kabupaten">
              <Input id="kabupaten" value={form.nama_kabupaten} onChange={(e) => setField("nama_kabupaten", e.target.value)} disabled={!isAdmin} />
            </FormField>
            <FormField label="Provinsi" id="provinsi">
              <Input id="provinsi" value={form.nama_provinsi} onChange={(e) => setField("nama_provinsi", e.target.value)} disabled={!isAdmin} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Nama Lengkap (Kop Surat)" id="nama_lengkap">
                <Input id="nama_lengkap" value={form.nama_lengkap} onChange={(e) => setField("nama_lengkap", e.target.value)} disabled={!isAdmin} placeholder="Misal: KALURAHAN SIDOHARJO" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* ── Data Lurah ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-primary" />
              Data Lurah / Kepala Desa
            </CardTitle>
            <CardDescription>Informasi penandatangan surat resmi</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Lurah" id="nama_lurah">
              <Input id="nama_lurah" value={form.nama_lurah ?? ""} onChange={(e) => setField("nama_lurah", e.target.value)} disabled={!isAdmin} />
            </FormField>
            <FormField label="NIP Lurah" id="nip_lurah">
              <Input id="nip_lurah" value={form.nip_lurah ?? ""} onChange={(e) => setField("nip_lurah", e.target.value)} disabled={!isAdmin} placeholder="19XXXXXXXXXXXXXX" />
            </FormField>
          </CardContent>
        </Card>

        {/* ── Kontak & Alamat ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-primary" />
              Alamat & Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormField label="Alamat Kantor" id="alamat">
                <Input id="alamat" value={form.alamat ?? ""} onChange={(e) => setField("alamat", e.target.value)} disabled={!isAdmin} />
              </FormField>
            </div>
            <FormField label="Kode Pos" id="kode_pos">
              <Input id="kode_pos" value={form.kode_pos ?? ""} onChange={(e) => setField("kode_pos", e.target.value)} disabled={!isAdmin} maxLength={6} />
            </FormField>
            <FormField label="Telepon" id="telepon">
              <Input id="telepon" value={form.telepon ?? ""} onChange={(e) => setField("telepon", e.target.value)} disabled={!isAdmin} placeholder="(0274) XXXXXX" />
            </FormField>
            <FormField label="Email" id="email">
              <Input id="email" type="email" value={form.email ?? ""} onChange={(e) => setField("email", e.target.value)} disabled={!isAdmin} />
            </FormField>
            <FormField label="Website" id="website">
              <Input id="website" value={form.website ?? ""} onChange={(e) => setField("website", e.target.value)} disabled={!isAdmin} placeholder="https://..." />
            </FormField>
          </CardContent>
        </Card>

        {/* ── Upload Aset ────────────────────────────────────────────── */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSignature className="w-5 h-5 text-primary" />
                Aset Visual Surat
              </CardTitle>
              <CardDescription>Logo dan tanda tangan yang disisipkan pada dokumen PDF/DOCX</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />

              {/* Logo */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Kalurahan" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Image className="w-10 h-10 text-muted-foreground/40" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-sm">Logo Kalurahan</p>
                  <p className="text-xs text-muted-foreground">Format PNG/JPG/SVG. Disarankan ukuran persegi, minimal 200×200px.</p>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadLogo(f); }}
                  />
                  <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()} disabled={isUploadingLogo} className="gap-2">
                    {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {logoPreview ? "Ganti Logo" : "Upload Logo"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* TTD Lurah */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-48 h-28 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                    {ttdPreview ? (
                      <img src={ttdPreview} alt="Tanda Tangan Lurah" className="w-full h-full object-contain p-2" />
                    ) : (
                      <FileSignature className="w-10 h-10 text-muted-foreground/40" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-sm">Tanda Tangan Digital Lurah</p>
                  <p className="text-xs text-muted-foreground">
                    Format PNG dengan latar transparan. Gambar tanda tangan yang akan otomatis disisipkan pada setiap PDF surat yang diterbitkan.
                  </p>
                  <input
                    ref={ttdRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadTtd(f); }}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => ttdRef.current?.click()} disabled={isUploadingTtd} className="gap-2">
                      {isUploadingTtd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {ttdPreview ? "Ganti TTD" : "Upload TTD"}
                    </Button>
                    {ttdPreview && (
                      <Button variant="outline" size="sm" onClick={handleDeleteTtd} disabled={isDeletingTtd} className="gap-2 text-destructive hover:text-destructive border-destructive/30">
                        {isDeletingTtd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save bottom */}
        {isAdmin && (
          <div className="flex justify-end pb-4">
            <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Semua Perubahan
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
