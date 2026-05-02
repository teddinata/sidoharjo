import { useState, useCallback } from "react";
import { pendudukApi, PendudukDetail } from "@/lib/api";

type LookupStatus = "idle" | "loading" | "found" | "not_found" | "error";

interface UseLookupNikReturn {
  status: LookupStatus;
  penduduk: PendudukDetail | null;
  errorMessage: string | null;
  lookup: (nik: string) => Promise<PendudukDetail | null>;
  reset: () => void;
}

export function useLookupNik(): UseLookupNikReturn {
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [penduduk, setPenduduk] = useState<PendudukDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lookup = useCallback(async (nik: string): Promise<PendudukDetail | null> => {
    setStatus("loading");
    setErrorMessage(null);
    setPenduduk(null);

    try {
      const { data } = await pendudukApi.getByNik(nik);
      // Response: { data: PendudukDetail }
      setPenduduk(data.data);
      setStatus("found");
      return data.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setStatus("not_found");
        setErrorMessage(
          err.response.data?.message ??
          "NIK tidak ditemukan dalam database. Isi data secara manual."
        );
      } else {
        setStatus("error");
        setErrorMessage("Gagal menghubungi server. Periksa koneksi Anda.");
      }
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setPenduduk(null);
    setErrorMessage(null);
  }, []);

  return { status, penduduk, errorMessage, lookup, reset };
}