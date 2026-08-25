import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Users } from "lucide-react";
import { pendudukApi, type AnggotaKeluarga } from "@/lib/api";

interface Props {
  /** NIK pemohon; anggota diambil dari kartu keluarga miliknya. */
  nik: string;
  label: string;
  /** NIK terpilih, dipisah koma. */
  value: string;
  onChange: (value: string) => void;
}

/**
 * Daftar anggota kartu keluarga untuk dicentang — dipakai memilih siapa yang
 * benar-benar ikut, mis. anggota keluarga yang ikut pindah.
 *
 * Saat pertama dimuat semuanya dicentang, karena umumnya satu keluarga pindah
 * bersama; petugas tinggal melepas yang tidak ikut.
 */
export function PilihAnggotaKeluarga({ nik, label, value, onChange }: Props) {
  const [anggota, setAnggota] = useState<AnggotaKeluarga[]>([]);
  const [status, setStatus] = useState<"memuat" | "siap" | "gagal">("memuat");
  const sudahDiisiAwal = useRef(false);

  useEffect(() => {
    let dibatalkan = false;
    sudahDiisiAwal.current = false;
    setStatus("memuat");

    pendudukApi
      .getKeluarga(nik)
      .then(({ data }) => {
        if (dibatalkan) return;
        setAnggota(data.data);
        setStatus("siap");

        // Centang semua hanya sekali di awal, supaya pilihan petugas — termasuk
        // saat semua sengaja dilepas — tidak tertimpa saat komponen dirender ulang.
        if (!sudahDiisiAwal.current) {
          sudahDiisiAwal.current = true;
          onChange(data.data.map((a) => a.nik).join(","));
        }
      })
      .catch(() => {
        if (!dibatalkan) setStatus("gagal");
      });

    return () => {
      dibatalkan = true;
    };
    // onChange sengaja tidak diikutkan: identitasnya berubah tiap render dan akan
    // memicu pengambilan data berulang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nik]);

  const terpilih = value ? value.split(",").filter(Boolean) : [];

  const ubah = (nikAnggota: string, dicentang: boolean) => {
    const berikutnya = dicentang
      ? [...terpilih, nikAnggota]
      : terpilih.filter((n) => n !== nikAnggota);

    // Urutkan mengikuti urutan daftar supaya nomor baris di surat tetap runtut.
    onChange(anggota.map((a) => a.nik).filter((n) => berikutnya.includes(n)).join(","));
  };

  return (
    <div>
      <Label>{label}</Label>

      {status === "memuat" && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat anggota keluarga…
        </p>
      )}

      {status === "gagal" && (
        <p className="mt-2 text-sm text-destructive">
          Gagal memuat anggota keluarga. Tabel di surat akan dibiarkan kosong untuk diisi tangan.
        </p>
      )}

      {status === "siap" && anggota.length === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Data kartu keluarga tidak ditemukan. Tabel di surat dibiarkan kosong untuk diisi tangan.
        </p>
      )}

      {status === "siap" && anggota.length > 0 && (
        <>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {terpilih.length} dari {anggota.length} anggota dipilih · maksimal 5 baris tercetak
          </p>

          <div className="mt-2 space-y-1 rounded-md border p-3">
            {anggota.map((a, i) => {
              const dicentang = terpilih.includes(a.nik);
              const lewatBatas = dicentang && terpilih.indexOf(a.nik) >= 5;

              return (
                <label
                  key={a.nik}
                  className="flex cursor-pointer select-none items-center gap-2.5 py-0.5"
                >
                  <Checkbox
                    checked={dicentang}
                    onCheckedChange={(v) => ubah(a.nik, !!v)}
                  />
                  <span className="text-sm">
                    {a.nama_lengkap}
                    {a.hub_keluarga && (
                      <span className="text-muted-foreground"> · {a.hub_keluarga}</span>
                    )}
                    {a.umur !== null && (
                      <span className="text-muted-foreground"> · {a.umur} th</span>
                    )}
                  </span>
                  {lewatBatas && (
                    <span className="text-xs text-amber-600">tidak muat, tulis tangan</span>
                  )}
                  {i === 0 && <span className="text-xs text-muted-foreground">(pemohon)</span>}
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
