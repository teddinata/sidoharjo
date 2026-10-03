import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MasterRw, rtRwApi } from "@/lib/api";

/**
 * Daftar Ketua RT & Ketua RW. Nama ketua disimpan sekali per RT/RW, jadi
 * mengubahnya di sini langsung berlaku untuk semua warga di wilayah tersebut.
 */
export function KetuaRtRw() {
  const [cari, setCari] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["rt-rw"],
    queryFn: () => rtRwApi.list().then((r) => r.data.data),
    staleTime: 30_000,
  });

  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return data ?? [];

    return (data ?? []).filter((rw) =>
      [rw.nomor, rw.pedukuhan, rw.nama_ketua, ...rw.rt.flatMap((rt) => [rt.nomor, rt.nama_ketua])]
        .some((v) => (v ?? "").toLowerCase().includes(q))
    );
  }, [data, cari]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Nama ketua yang diubah di sini langsung berlaku untuk semua warga di RT/RW tersebut, termasuk surat yang dicetak berikutnya.
        </p>
        <div className="relative sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari RT, RW, pedukuhan, nama..." value={cari} onChange={(e) => setCari(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : daftar.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Tidak ada RT/RW ditemukan.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {daftar.map((rw) => <KartuRw key={rw.id} rw={rw} />)}
        </div>
      )}
    </div>
  );
}

function KartuRw({ rw }: { rw: MasterRw }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold">
            RW {rw.nomor}
            {rw.pedukuhan && <span className="font-normal text-muted-foreground"> · {rw.pedukuhan}</span>}
          </p>
          <span className="text-xs text-muted-foreground">{rw.jumlah_warga} warga</span>
        </div>
        <IsianKetua
          label={`Ketua RW ${rw.nomor}`}
          awal={rw.nama_ketua}
          simpan={(nama) => rtRwApi.updateRw(rw.id, { nama_ketua: nama })}
        />
      </div>
      <div className="divide-y divide-border">
        {rw.rt.map((rt) => (
          <div key={rt.id} className="flex items-center gap-3 px-4 py-2">
            <div className="w-16 shrink-0">
              <p className="text-sm font-medium">RT {rt.nomor}</p>
              <p className="text-xs text-muted-foreground">{rt.jumlah_warga} warga</p>
            </div>
            <div className="flex-1">
              <IsianKetua
                label={`Ketua RT ${rt.nomor} RW ${rw.nomor}`}
                awal={rt.nama_ketua}
                simpan={(nama) => rtRwApi.updateRt(rt.id, { nama_ketua: nama })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Input nama ketua; tombol simpan muncul bila nilainya berubah. */
function IsianKetua({
  label,
  awal,
  simpan,
}: {
  label: string;
  awal: string | null;
  simpan: (nama: string | null) => Promise<{ data: { message: string } }>;
}) {
  const qc = useQueryClient();
  const [nilai, setNilai] = useState(awal ?? "");
  const berubah = nilai.trim() !== (awal ?? "");

  const mutation = useMutation({
    mutationFn: () => simpan(nilai.trim() || null).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["rt-rw"] });
      qc.invalidateQueries({ queryKey: ["penduduk-list"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Gagal menyimpan nama ketua."),
  });

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (berubah) mutation.mutate();
      }}
    >
      <Input
        aria-label={label}
        value={nilai}
        onChange={(e) => setNilai(e.target.value)}
        placeholder="Belum diisi"
        maxLength={100}
        className="h-8"
      />
      {berubah && (
        <Button type="submit" size="sm" className="h-8 shrink-0" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />Simpan</>}
        </Button>
      )}
    </form>
  );
}
