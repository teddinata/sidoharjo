import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { pendudukApi, type AnggotaKeluarga } from "@/lib/api";

/** Baris yang tersedia di tabel surat; sisanya harus ditulis tangan. */
const BATAS_BARIS = 5;

interface Props {
  /** NIK pemohon; anggota diambil dari kartu keluarga miliknya. */
  nik: string;
  label: string;
  /** NIK terpilih, dipisah koma. */
  value: string;
  onChange: (value: string) => void;
}

/**
 * Pemilih anggota kartu keluarga yang bisa dicari — dipakai menentukan siapa yang
 * benar-benar ikut pindah, karena tidak selalu satu keluarga penuh.
 *
 * Saat pertama dimuat semuanya terpilih (umumnya memang pindah bersama); petugas
 * tinggal mengeluarkan yang tidak ikut lewat pencarian atau tombol hapus di daftar.
 */
export function PilihAnggotaKeluarga({ nik, label, value, onChange }: Props) {
  const [anggota, setAnggota] = useState<AnggotaKeluarga[]>([]);
  const [status, setStatus] = useState<"memuat" | "siap" | "gagal">("memuat");
  const [terbuka, setTerbuka] = useState(false);
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

        // Hanya sekali di awal, supaya pilihan yang sudah diubah petugas — termasuk
        // saat semua sengaja dikosongkan — tidak tertimpa saat komponen dirender ulang.
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

  const terpilih = useMemo(
    () => (value ? value.split(",").filter(Boolean) : []),
    [value],
  );

  /** Simpan mengikuti urutan daftar supaya nomor baris di surat tetap runtut. */
  const simpan = (nikTerpilih: string[]) =>
    onChange(anggota.map((a) => a.nik).filter((n) => nikTerpilih.includes(n)).join(","));

  const alihkan = (nikAnggota: string) =>
    simpan(
      terpilih.includes(nikAnggota)
        ? terpilih.filter((n) => n !== nikAnggota)
        : [...terpilih, nikAnggota],
    );

  if (status === "memuat") {
    return (
      <div>
        <Label>{label}</Label>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat anggota keluarga…
        </p>
      </div>
    );
  }

  if (status === "gagal" || anggota.length === 0) {
    return (
      <div>
        <Label>{label}</Label>
        <p className="mt-2 text-sm text-muted-foreground">
          {status === "gagal"
            ? "Gagal memuat anggota keluarga."
            : "Data kartu keluarga tidak ditemukan."}{" "}
          Tabel di surat dibiarkan kosong untuk diisi tangan.
        </p>
      </div>
    );
  }

  const dipilih = anggota.filter((a) => terpilih.includes(a.nik));

  return (
    <div>
      <Label>{label}</Label>

      <Popover open={terbuka} onOpenChange={setTerbuka}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={terbuka}
            className="mt-1 w-full justify-between font-normal"
          >
            {dipilih.length > 0
              ? `${dipilih.length} dari ${anggota.length} anggota dipilih`
              : "Belum ada anggota dipilih"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command
            filter={(nilai, cari) =>
              nilai.toLowerCase().includes(cari.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput placeholder="Cari nama atau NIK…" />
            <CommandList>
              <CommandEmpty>Tidak ada anggota yang cocok.</CommandEmpty>
              <CommandGroup>
                {anggota.map((a) => {
                  const aktif = terpilih.includes(a.nik);

                  return (
                    <CommandItem
                      key={a.nik}
                      value={`${a.nama_lengkap} ${a.nik} ${a.hub_keluarga ?? ""}`}
                      onSelect={() => alihkan(a.nik)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          aktif ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="flex-1">
                        {a.nama_lengkap}
                        {a.hub_keluarga && (
                          <span className="text-muted-foreground"> · {a.hub_keluarga}</span>
                        )}
                        {a.umur !== null && (
                          <span className="text-muted-foreground"> · {a.umur} th</span>
                        )}
                      </span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {a.nik}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {dipilih.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {dipilih.map((a, i) => (
            <Badge
              key={a.nik}
              variant={i < BATAS_BARIS ? "secondary" : "outline"}
              className="gap-1 font-normal"
              title={
                i < BATAS_BARIS
                  ? a.nik
                  : `${a.nik} — di luar ${BATAS_BARIS} baris, perlu ditulis tangan`
              }
            >
              <span className="text-muted-foreground">{i + 1}.</span>
              {a.nama_lengkap}
              <button
                type="button"
                onClick={() => alihkan(a.nik)}
                className="ml-0.5 rounded-sm opacity-60 hover:opacity-100"
                aria-label={`Keluarkan ${a.nama_lengkap}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {dipilih.length > BATAS_BARIS && (
        <p className="mt-1.5 text-xs text-amber-600">
          Tabel di surat hanya menyediakan {BATAS_BARIS} baris — {dipilih.length - BATAS_BARIS}{" "}
          nama terakhir perlu ditulis tangan.
        </p>
      )}
    </div>
  );
}
