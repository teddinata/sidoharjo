import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { pendudukApi, PendudukDetail, PendudukPayload } from "@/lib/api";
import { PADUKUHAN_LIST, AGAMA_LIST, PEKERJAAN_LIST, STATUS_PERKAWINAN_LIST } from "@/types/surat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const HUB_KELUARGA_LIST = ["Kepala Keluarga", "Istri", "Anak", "Menantu", "Cucu", "Orang Tua", "Mertua", "Famili Lain"];
const PENDIDIKAN_LIST = ["Tidak/Belum Sekolah", "SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "D1/D2/D3", "S1/D4", "S2", "S3"];

const emptyForm: PendudukPayload = {
  nik: "", nama_lengkap: "", tempat_lahir: "", tanggal_lahir: "",
  jenis_kelamin: "Laki-laki", agama: "Islam", pendidikan: "", pekerjaan: "",
  status_perkawinan: "Belum Kawin", hub_keluarga: "Kepala Keluarga",
  pedukuhan: "", rt: "", rw: "", no_kk: "",
  nama_ketua_rt: "", nama_ketua_rw: "", nama_ayah: "", nama_ibu: "",
};

export default function DataPenduduk() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [pedukuhan, setPedukuhan] = useState("");
  const [isAktif, setIsAktif] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Modals
  const [detailPenduduk, setDetailPenduduk] = useState<PendudukDetail | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PendudukDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PendudukDetail | null>(null);
  const [form, setForm] = useState<PendudukPayload>(emptyForm);

  const queryKey = ["penduduk-list", search, pedukuhan, isAktif, page];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      pendudukApi.list({
        search: search || undefined,
        pedukuhan: pedukuhan || undefined,
        is_aktif: isAktif === "all" ? undefined : isAktif === "aktif",
        page,
        per_page: 15,
      }).then((r) => r.data),
    staleTime: 30_000,
  });

  const setField = useCallback((key: keyof PendudukPayload, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (p: PendudukDetail) => {
    setEditTarget(p);
    setForm({
      nik: p.nik, nama_lengkap: p.nama_lengkap, tempat_lahir: p.tempat_lahir,
      tanggal_lahir: p.tanggal_lahir ?? "", jenis_kelamin: p.jenis_kelamin as any,
      agama: p.agama, pendidikan: p.pendidikan ?? "", pekerjaan: p.pekerjaan,
      status_perkawinan: p.status_perkawinan as any, hub_keluarga: p.hub_keluarga,
      pedukuhan: p.pedukuhan, rt: p.rt, rw: p.rw, no_kk: p.no_kk ?? "",
      nama_ketua_rt: p.nama_ketua_rt ?? "", nama_ketua_rw: p.nama_ketua_rw ?? "",
      nama_ayah: p.nama_ayah ?? "", nama_ibu: p.nama_ibu ?? "",
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      editTarget
        ? pendudukApi.update(editTarget.id, form).then((r) => r.data)
        : pendudukApi.create(form).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["penduduk-list"] });
      setFormOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Gagal menyimpan data.";
      const errors = err?.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0] as string[];
        toast.error(first[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => pendudukApi.toggleAktif(id).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["penduduk-list"] });
    },
    onError: () => toast.error("Gagal mengubah status."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pendudukApi.destroy(id).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["penduduk-list"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Gagal menghapus data.");
      setDeleteTarget(null);
    },
  });

  const meta = data?.meta;
  const rows = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Penduduk</h1>
            <p className="text-muted-foreground text-sm">
              {meta ? `Total ${meta.total.toLocaleString("id-ID")} penduduk terdaftar` : "Memuat data..."}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Penduduk
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari NIK atau nama..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={pedukuhan} onValueChange={(v) => { setPedukuhan(v === "_all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Semua Pedukuhan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Semua Pedukuhan</SelectItem>
              {PADUKUHAN_LIST.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={isAktif} onValueChange={(v) => { setIsAktif(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="hidden sm:table-cell">NIK</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead className="hidden md:table-cell">Pedukuhan</TableHead>
                <TableHead className="hidden lg:table-cell">RT/RW</TableHead>
                <TableHead className="hidden lg:table-cell">Pekerjaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Tidak ada data penduduk ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="hidden sm:table-cell font-mono text-xs">{p.nik}</TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <p>{p.nama_lengkap}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{p.pedukuhan}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{p.pedukuhan}</TableCell>
                    <TableCell className="hidden lg:table-cell">{p.rt}/{p.rw}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{p.pekerjaan}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_aktif ? "default" : "secondary"}
                        className={p.is_aktif ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : ""}>
                        {p.is_aktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailPenduduk(p)} title="Detail">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex" onClick={() => openEdit(p)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex"
                          onClick={() => toggleMutation.mutate(p.id)}
                          disabled={toggleMutation.isPending}
                          title={p.is_aktif ? "Nonaktifkan" : "Aktifkan"}>
                          {p.is_aktif ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(p)} title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} data)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
              </Button>
              <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
                Berikutnya <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <Dialog open={!!detailPenduduk} onOpenChange={(v) => !v && setDetailPenduduk(null)}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Detail Penduduk</DialogTitle>
          </DialogHeader>
          {detailPenduduk && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mt-2">
              {([
                ["NIK", detailPenduduk.nik],
                ["No. KK", detailPenduduk.no_kk ?? "-"],
                ["Nama Lengkap", detailPenduduk.nama_lengkap],
                ["Tempat / Tgl Lahir", `${detailPenduduk.tempat_lahir}, ${detailPenduduk.tanggal_lahir_format}`],
                ["Umur", `${detailPenduduk.umur} tahun`],
                ["Jenis Kelamin", detailPenduduk.jenis_kelamin],
                ["Agama", detailPenduduk.agama],
                ["Pendidikan", detailPenduduk.pendidikan ?? "-"],
                ["Pekerjaan", detailPenduduk.pekerjaan],
                ["Status Perkawinan", detailPenduduk.status_perkawinan],
                ["Hub. Keluarga", detailPenduduk.hub_keluarga],
                ["Pedukuhan", detailPenduduk.pedukuhan],
                ["RT / RW", `${detailPenduduk.rt} / ${detailPenduduk.rw}`],
                ["Nama Ayah", detailPenduduk.nama_ayah ?? "-"],
                ["Nama Ibu", detailPenduduk.nama_ibu ?? "-"],
                ["Ketua RT", detailPenduduk.nama_ketua_rt ?? "-"],
                ["Ketua RW", detailPenduduk.nama_ketua_rw ?? "-"],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium">{val}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Alamat Lengkap</p>
                <p className="font-medium">{detailPenduduk.alamat_lengkap}</p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDetailPenduduk(null)}>Tutup</Button>
            {detailPenduduk && (
              <Button onClick={() => { openEdit(detailPenduduk); setDetailPenduduk(null); }}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Form Modal (Tambah / Edit) ────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Penduduk" : "Tambah Penduduk Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <FormField label="NIK *" id="nik">
              <Input id="nik" value={form.nik} onChange={(e) => setField("nik", e.target.value)} maxLength={16} placeholder="16 digit NIK" />
            </FormField>
            <FormField label="No. KK" id="no_kk">
              <Input id="no_kk" value={form.no_kk ?? ""} onChange={(e) => setField("no_kk", e.target.value)} maxLength={16} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Nama Lengkap *" id="nama">
                <Input id="nama" value={form.nama_lengkap} onChange={(e) => setField("nama_lengkap", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Tempat Lahir *" id="tempat">
              <Input id="tempat" value={form.tempat_lahir} onChange={(e) => setField("tempat_lahir", e.target.value)} />
            </FormField>
            <FormField label="Tanggal Lahir *" id="tgl">
              <Input id="tgl" type="date" value={form.tanggal_lahir} onChange={(e) => setField("tanggal_lahir", e.target.value)} />
            </FormField>
            <FormField label="Jenis Kelamin *" id="jk">
              <Select value={form.jenis_kelamin} onValueChange={(v) => setField("jenis_kelamin", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Agama *" id="agama">
              <Select value={form.agama} onValueChange={(v) => setField("agama", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AGAMA_LIST.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Pendidikan" id="pendidikan">
              <Select value={form.pendidikan ?? ""} onValueChange={(v) => setField("pendidikan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih pendidikan" /></SelectTrigger>
                <SelectContent>{PENDIDIKAN_LIST.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Pekerjaan *" id="pekerjaan">
              <Select value={form.pekerjaan} onValueChange={(v) => setField("pekerjaan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih pekerjaan" /></SelectTrigger>
                <SelectContent>{PEKERJAAN_LIST.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Status Perkawinan *" id="status_kaw">
              <Select value={form.status_perkawinan} onValueChange={(v) => setField("status_perkawinan", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_PERKAWINAN_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Hubungan Keluarga *" id="hub">
              <Select value={form.hub_keluarga} onValueChange={(v) => setField("hub_keluarga", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HUB_KELUARGA_LIST.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Pedukuhan *" id="pdkh">
              <Select value={form.pedukuhan} onValueChange={(v) => setField("pedukuhan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih pedukuhan" /></SelectTrigger>
                <SelectContent>{PADUKUHAN_LIST.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="RT *" id="rt">
              <Input id="rt" value={form.rt} onChange={(e) => setField("rt", e.target.value)} placeholder="01" maxLength={5} />
            </FormField>
            <FormField label="RW *" id="rw">
              <Input id="rw" value={form.rw} onChange={(e) => setField("rw", e.target.value)} placeholder="01" maxLength={5} />
            </FormField>
            <FormField label="Nama Ketua RT" id="rt_name">
              <Input id="rt_name" value={form.nama_ketua_rt ?? ""} onChange={(e) => setField("nama_ketua_rt", e.target.value)} />
            </FormField>
            <FormField label="Nama Ketua RW" id="rw_name">
              <Input id="rw_name" value={form.nama_ketua_rw ?? ""} onChange={(e) => setField("nama_ketua_rw", e.target.value)} />
            </FormField>
            <FormField label="Nama Ayah" id="ayah">
              <Input id="ayah" value={form.nama_ayah ?? ""} onChange={(e) => setField("nama_ayah", e.target.value)} />
            </FormField>
            <FormField label="Nama Ibu" id="ibu">
              <Input id="ibu" value={form.nama_ibu ?? ""} onChange={(e) => setField("nama_ibu", e.target.value)} />
            </FormField>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="min-w-28">
              {saveMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Menyimpan...</> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Konfirmasi Hapus ─────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus data penduduk{" "}
            <span className="font-semibold text-foreground">{deleteTarget?.nama_lengkap}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
