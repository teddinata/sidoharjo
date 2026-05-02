import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Filter, Download, Eye, ChevronRight, ChevronLeft,
  FileText, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { registerApi, suratApi, RegisterItem, RegisterListParams } from "@/lib/api";
import { PADUKUHAN_LIST } from "@/types/surat";

// ── Hook ──────────────────────────────────────────────────────────────────────
interface Filters {
  dari: string;
  sampai: string;
  pedukuhan: string;
  jenis: string;
  page: number;
  per_page: number;
}

const thisYear = new Date().getFullYear();
const DEFAULT_FILTERS: Filters = {
  dari: `${thisYear}-01-01`,
  sampai: `${thisYear}-12-31`,
  pedukuhan: "",
  jenis: "",
  page: 1,
  per_page: 15,
};

function useRegisterList() {
  const [data, setData] = useState<RegisterItem[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number; per_page: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);

  // Debounce untuk search field — tidak ada di register, tapi untuk dari/sampai yang diketik
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (f: Filters) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const params: RegisterListParams = {
        page: f.page,
        per_page: f.per_page,
      };
      if (f.dari) params.dari = f.dari;
      if (f.sampai) params.sampai = f.sampai;
      if (f.pedukuhan) params.pedukuhan = f.pedukuhan;
      if (f.jenis) params.jenis = f.jenis;

      const { data: res } = await registerApi.list(params);
      setData(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err?.response?.data?.message ?? "Gagal memuat data register.");
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(filters); }, [filters, fetchData]);

  const setFilters = useCallback((partial: Partial<Filters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...partial,
      page: partial.page ?? 1,
    }));
  }, []);

  return {
    data, meta, isLoading, isError, errorMessage, filters,
    setFilters,
    refresh: () => fetchData(filters),
  };
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({
  item, open, onClose,
}: { item: RegisterItem | null; open: boolean; onClose: () => void }) {
  const [isDownloading, setIsDownloading] = useState<"pdf" | "docx" | null>(null);
  if (!item) return null;

  const handleDownload = async (format: "pdf" | "docx") => {
    setIsDownloading(format);
    try {
      if (format === "pdf") await suratApi.downloadPdf(item.id);
      else await suratApi.downloadDocx(item.id);
      toast.success(`${format.toUpperCase()} berhasil diunduh.`);
    } catch {
      toast.error(`Gagal mengunduh ${format.toUpperCase()}. Pastikan surat sudah berstatus terbit.`);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg">Detail Register</h2>
              <p className="text-sm font-mono text-muted-foreground mt-0.5">{item.nomor_surat}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none mt-1">×</button>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[
                { label: "No. Register", value: item.nomor_register },
                { label: "Tanggal", value: item.tanggal },
                { label: "Jenis Pelayanan", value: item.jenis_pelayanan },
                { label: "Petugas", value: item.petugas },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="font-medium">{row.value}</p>
                </div>
              ))}
              {item.keterangan && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Keterangan</p>
                  <p className="font-medium">{item.keterangan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pemohon */}
          <div className="space-y-2.5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pemohon</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { label: "NIK", value: item.nik_pemohon, mono: true },
                { label: "Nama", value: item.nama_pemohon },
                { label: "Pedukuhan", value: item.pedukuhan },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className={`font-medium ${row.mono ? "font-mono text-xs" : ""}`}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onClose}>Tutup</Button>
            <Button
              variant="outline" size="sm"
              onClick={() => handleDownload("docx")}
              disabled={!!isDownloading}
            >
              {isDownloading === "docx" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FileText className="w-4 h-4 mr-1" />}
              DOCX
            </Button>
            <Button
              size="sm"
              onClick={() => handleDownload("pdf")}
              disabled={!!isDownloading}
            >
              {isDownloading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Download className="w-4 h-4 mr-1" />}
              PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Halaman utama ─────────────────────────────────────────────────────────────
const ArsipData = () => {
  const { data, meta, isLoading, isError, errorMessage, filters, setFilters, refresh } = useRegisterList();
  const [selected, setSelected] = useState<RegisterItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await registerApi.export({
        dari: filters.dari || undefined,
        sampai: filters.sampai || undefined,
        pedukuhan: filters.pedukuhan || undefined,
      });
      toast.success("Export berhasil.");
    } catch {
      toast.error("Gagal mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Arsip Data</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Register Pelayanan</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Riwayat seluruh surat yang telah diterbitkan</p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading}>
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Dari tanggal */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Dari Tanggal</label>
                <Input
                  type="date"
                  value={filters.dari}
                  onChange={(e) => setFilters({ dari: e.target.value })}
                />
              </div>
              {/* Sampai tanggal */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Sampai Tanggal</label>
                <Input
                  type="date"
                  value={filters.sampai}
                  onChange={(e) => setFilters({ sampai: e.target.value })}
                />
              </div>
              {/* Pedukuhan */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Pedukuhan</label>
                <Select
                  value={filters.pedukuhan || "all"}
                  onValueChange={(v) => setFilters({ pedukuhan: v === "all" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Pedukuhan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Pedukuhan</SelectItem>
                    {PADUKUHAN_LIST.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Tombol refresh */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={refresh}
                  disabled={isLoading}
                  className="w-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Muat Ulang
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Daftar Register
              {meta && (
                <span className="font-normal text-muted-foreground text-sm">
                  ({meta.total.toLocaleString("id-ID")} total)
                </span>
              )}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">

            {isError && !isLoading && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <AlertCircle className="w-10 h-10 text-destructive/50" />
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Button variant="outline" size="sm" onClick={refresh}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
                </Button>
              </div>
            )}

            {!isError && !isLoading && data.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Tidak ada data di periode ini.</p>
              </div>
            )}

            {!isError && (data.length > 0 || isLoading) && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">No. Register</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead className="hidden md:table-cell">NIK</TableHead>
                      <TableHead className="hidden sm:table-cell">Jenis</TableHead>
                      <TableHead className="hidden lg:table-cell">No. Surat</TableHead>
                      <TableHead className="pr-6 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && data.length === 0
                      ? Array.from({ length: 8 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 7 }).map((_, j) => (
                              <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                            ))}
                          </TableRow>
                        ))
                      : data.map((item) => (
                          <TableRow key={item.id} className={isLoading ? "opacity-50" : ""}>
                            <TableCell className="pl-6 font-mono text-xs font-medium">
                              {item.nomor_register}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">{item.tanggal}</TableCell>
                            <TableCell>
                              <p className="font-medium text-sm">{item.nama_pemohon}</p>
                              <p className="text-xs text-muted-foreground">{item.pedukuhan}</p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                              {item.nik_pemohon}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{item.jenis_pelayanan}</TableCell>
                            <TableCell className="hidden lg:table-cell font-mono text-xs">{item.nomor_surat}</TableCell>
                            <TableCell className="pr-6 text-right">
                              <Button variant="ghost" size="sm" onClick={() => setSelected(item)}>
                                <Eye className="w-4 h-4 mr-1.5" />
                                Lihat
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t">
                <p className="text-sm text-muted-foreground order-2 sm:order-1">
                  Halaman {meta.current_page} / {meta.last_page} · {meta.total.toLocaleString("id-ID")} data
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setFilters({ page: meta.current_page - 1 })}
                    disabled={meta.current_page <= 1 || isLoading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Sebelumnya</span>
                  </Button>

                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
                      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`e-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === meta.current_page ? "default" : "outline"}
                            size="sm" className="w-8 h-8 p-0"
                            onClick={() => setFilters({ page: p as number })}
                            disabled={isLoading}
                          >{p}</Button>
                        )
                      )}
                  </div>

                  <Button
                    variant="outline" size="sm"
                    onClick={() => setFilters({ page: meta.current_page + 1 })}
                    disabled={meta.current_page >= meta.last_page || isLoading}
                  >
                    <span className="hidden sm:inline mr-1">Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Select
                  value={String(filters.per_page)}
                  onValueChange={(v) => setFilters({ per_page: Number(v), page: 1 })}
                >
                  <SelectTrigger className="w-20 h-8 text-xs order-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[15, 25, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}/hal</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selected && (
        <DetailModal item={selected} open={!!selected} onClose={() => setSelected(null)} />
      )}
    </AppLayout>
  );
};

export default ArsipData;