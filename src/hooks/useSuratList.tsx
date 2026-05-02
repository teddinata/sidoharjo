import { useState, useCallback, useEffect, useRef } from "react";
import { suratApi } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SuratItem {
  id: number;
  nomor_surat: string;
  jenis_surat: string;
  tanggal: string;
  status: "draft" | "selesai" | "dibatalkan";
  keperluan: string;
  keterangan?: string;
  created_at: string;
  pemohon: {
    nik: string;
    nama: string;
    padukuhan: string;
    alamat: string;
    rt: string;
    rw: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    agama: string;
    pekerjaan: string;
    status_perkawinan: string;
    kewarganegaraan: string;
  };
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface SuratFilters {
  search: string;
  jenis: string;
  status: string;
  page: number;
  per_page: number;
}

interface UseSuratListReturn {
  data: SuratItem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  filters: SuratFilters;
  setFilters: (partial: Partial<SuratFilters>) => void;
  refresh: () => void;
}

const DEFAULT_FILTERS: SuratFilters = {
  search: "",
  jenis: "",
  status: "",
  page: 1,
  per_page: 10,
};

/**
 * Hook untuk mengambil list surat dari backend dengan filter, search, dan pagination.
 * Setiap kali filters berubah, otomatis re-fetch.
 */
export function useSuratList(): UseSuratListReturn {
  const [data, setData] = useState<SuratItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<SuratFilters>(DEFAULT_FILTERS);

  // Debounce search agar tidak spam request saat mengetik
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSearchRef = useRef<string>("");

  const fetchData = useCallback(async (f: SuratFilters) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const params: Record<string, string | number> = {
        page: f.page,
        per_page: f.per_page,
      };
      if (f.search) params.search = f.search;
      if (f.jenis) params.jenis = f.jenis;
      if (f.status) params.status = f.status;

      const { data: responseData } = await suratApi.list(params as any);

      // Laravel default pagination:
      // { data: [...], links: {...}, meta: { current_page, last_page, total, per_page } }
      const items: SuratItem[] = responseData.data ?? [];
      const paginationMeta: PaginationMeta = responseData.meta ?? {
        current_page: 1,
        last_page: 1,
        total: items.length,
        per_page: f.per_page,
      };

      setData(items);
      setMeta(paginationMeta);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(
        err?.response?.data?.message ?? "Gagal memuat data surat."
      );
      setData([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch setiap kali filters berubah
  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  const setFilters = useCallback((partial: Partial<SuratFilters>) => {
    // Kalau search berubah → debounce 400ms dan reset ke page 1
    if ("search" in partial && partial.search !== undefined) {
      pendingSearchRef.current = partial.search;
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        setFiltersState((prev) => ({
          ...prev,
          search: pendingSearchRef.current,
          page: 1,
        }));
      }, 400);
      return;
    }

    // Filter lain (jenis, status, page) → langsung update
    setFiltersState((prev) => ({
      ...prev,
      ...partial,
      // Reset ke page 1 kalau filter selain page yang berubah
      page: partial.page ?? ("jenis" in partial || "status" in partial ? 1 : prev.page),
    }));
  }, []);

  const refresh = useCallback(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  return { data, meta, isLoading, isError, errorMessage, filters, setFilters, refresh };
}