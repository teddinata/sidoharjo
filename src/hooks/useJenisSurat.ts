import { useState, useEffect } from "react";
import { jenisSuratApi, JenisSuratItem } from "@/lib/api";

export interface JenisSuratGrouped {
  [kategori: string]: JenisSuratItem[];
}

export const useJenisSurat = () => {
  const [data, setData] = useState<JenisSuratGrouped>({});
  const [flat, setFlat] = useState<JenisSuratItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    jenisSuratApi.list()
      .then(({ data: res }) => {
        const grouped = res.data;
        setData(grouped);
        // Flatten semua jenis surat ke array tunggal
        const all = Object.values(grouped).flat();
        setFlat(all);
      })
      .catch(() => setError("Gagal memuat daftar jenis surat."))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, flat, isLoading, error };
};
