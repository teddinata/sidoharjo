import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — 401 global ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// POST /api/auth/login  → { message, token, user }
// GET  /api/auth/me     → { user }
// POST /api/auth/logout → { message }
// ─────────────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ message: string; token: string; user: AuthUser }>("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  me: () => api.get<{ user: AuthUser }>("/auth/me"),
};

// ─────────────────────────────────────────────────────────────────────────────
// PENDUDUK
// GET /api/penduduk?search=   autocomplete, min 3 char, max 15, no pagination
// GET /api/penduduk/{nik}     detail lengkap by NIK
// ─────────────────────────────────────────────────────────────────────────────
export const pendudukApi = {
  /** Autocomplete min 3 char (untuk form buat surat) */
  search: (search: string) =>
    api.get<{ data: PendudukSearchItem[]; message?: string }>("/penduduk", {
      params: { search },
    }),

  /** Detail lengkap by NIK */
  getByNik: (nik: string) =>
    api.get<{ data: PendudukDetail }>(`/penduduk/${nik}`),

  /** List paginated untuk halaman manajemen data */
  list: (params?: PendudukListParams) =>
    api.get<{ data: PendudukDetail[]; meta: { total: number; per_page: number; current_page: number; last_page: number } }>(
      "/penduduk-list",
      { params }
    ),

  /** Tambah penduduk baru */
  create: (payload: PendudukPayload) =>
    api.post<{ message: string; data: PendudukDetail }>("/penduduk", payload),

  /** Edit data penduduk */
  update: (id: number, payload: Partial<PendudukPayload>) =>
    api.put<{ message: string; data: PendudukDetail }>(`/penduduk/${id}`, payload),

  /** Aktifkan / nonaktifkan penduduk */
  toggleAktif: (id: number) =>
    api.patch<{ message: string; is_aktif: boolean }>(`/penduduk/${id}/toggle-aktif`),

  /** Hapus penduduk (hanya jika tidak punya riwayat surat) */
  destroy: (id: number) =>
    api.delete<{ message: string }>(`/penduduk/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// JENIS SURAT
// GET /api/jenis-surat        → { data: { [kategori]: JenisSuratItem[] } }
// GET /api/jenis-surat/{kode} → { data: JenisSuratDetail }
// ─────────────────────────────────────────────────────────────────────────────
export const jenisSuratApi = {
  list: () =>
    api.get<{ data: Record<string, JenisSuratItem[]> }>("/jenis-surat"),
  get: (kode: string) =>
    api.get<{ data: JenisSuratDetail }>(`/jenis-surat/${kode}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// GET /api/settings   → { data: KalurahanSettings }
// PUT /api/settings   → { message }  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => api.get<{ data: KalurahanSettings }>("/settings"),
  update: (payload: Partial<KalurahanSettings>) => api.put("/settings", payload),
};

// ─────────────────────────────────────────────────────────────────────────────
// SURAT
// POST /api/surat            → { message, data: SuratCreated }
// GET  /api/surat/{id}       → { data: SuratDetail }
// GET  /api/surat/{id}/pdf   → binary PDF
// GET  /api/surat/{id}/docx  → binary DOCX
// ─────────────────────────────────────────────────────────────────────────────
export const suratApi = {
  create: (payload: CreateSuratPayload) =>
    api.post<{ message: string; data: SuratCreated }>("/surat", payload),

  get: (id: number | string) =>
    api.get<{ data: SuratDetail }>(`/surat/${id}`),

  update: (id: number | string, payload: { data_tambahan?: Record<string, string | number | boolean>; data_pihak_luar?: Record<string, string | number | boolean> }) =>
    api.put<{ message: string; data_tambahan: Record<string, unknown> }>(`/surat/${id}`, payload),

  downloadPdf: (id: number | string, customFilename?: string) =>
    downloadFile(`/surat/${id}/pdf`, customFilename || `surat-${id}.pdf`),

  downloadDocx: (id: number | string, customFilename?: string) =>
    downloadFile(`/surat/${id}/docx`, customFilename || `surat-${id}.docx`),
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER PELAYANAN
// GET /api/register         → { data: RegisterItem[], meta: {...} }
// GET /api/register/rekap   → rekap statistik
// GET /api/register/export  → blob Excel
// ─────────────────────────────────────────────────────────────────────────────
export const registerApi = {
  list: (params?: RegisterListParams) =>
    api.get<RegisterListResponse>("/register", { params }),

  rekap: (params?: { tahun?: number; bulan?: number }) =>
    api.get<RegisterRekap>("/register/rekap", { params }),

  export: async (params?: { tahun?: number; dari?: string; sampai?: string; pedukuhan?: string }) => {
    const response = await api.get("/register/export", {
      params,
      responseType: "blob",
    });
    triggerBlobDownload(
      response.data,
      `register-${params?.tahun ?? new Date().getFullYear()}.xlsx`
    );
  },

  update: (id: number, payload: RegisterUpdatePayload) =>
    api.put<{ message: string; data: RegisterItem }>(`/register/${id}`, payload),

  destroy: (id: number) =>
    api.delete<{ message: string }>(`/register/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const uploadApi = {
  logo: (file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return api.post("/upload/logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  ttdLurah: (file: File) => {
    const form = new FormData();
    form.append("ttd", file);
    return api.post("/upload/ttd-lurah", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteTtdLurah: () => api.delete("/upload/ttd-lurah"),
};

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const userApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<{ data: UserItem[] }>("/users", { params }),
  get: (id: number) => api.get<{ data: UserItem }>(`/users/${id}`),
  create: (payload: UserPayload) =>
    api.post<{ message: string; data: UserItem }>("/users", payload),
  update: (id: number, payload: Partial<Omit<UserPayload, "password" | "password_confirmation">>) =>
    api.put<{ message: string; data: UserItem }>(`/users/${id}`, payload),
  gantiPassword: (id: number, payload: { password: string; password_confirmation: string }) =>
    api.patch(`/users/${id}/password`, payload),
  toggleAktif: (id: number) =>
    api.patch<{ message: string; is_active: boolean }>(`/users/${id}/toggle-aktif`),
  destroy: (id: number) => api.delete(`/users/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

async function downloadFile(endpoint: string, filename: string): Promise<void> {
  const res = await api.get(endpoint, { responseType: "blob" });
  triggerBlobDownload(res.data, filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — 100% sesuai Postman docs
// ─────────────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "petugas";
  last_login_at?: string;
}

/** Hasil autocomplete GET /api/penduduk?search= */
export interface PendudukSearchItem {
  id: number;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  tanggal_lahir_format: string;
  umur: number;
  jenis_kelamin: string;
  pedukuhan: string;
  rt: string;
  rw: string;
  pekerjaan: string;
  status_perkawinan: string;
  hub_keluarga: string;
}

/** Detail lengkap GET /api/penduduk/{nik} */
export interface PendudukDetail {
  id: number;
  no_kk: string;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  tanggal_lahir_format: string;
  umur: number;
  jenis_kelamin: string;
  bin_binti: string;
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  status_perkawinan: string;
  hub_keluarga: string;
  pedukuhan: string;
  rt: string;
  rw: string;
  alamat_lengkap: string;
  nama_ketua_rt: string;
  nama_ketua_rw: string;
  nama_ayah: string;
  nama_ibu: string;
  is_aktif: boolean;
}

export interface PendudukListParams {
  search?: string;
  pedukuhan?: string;
  is_aktif?: boolean;
  per_page?: number;
  page?: number;
}

export interface PendudukPayload {
  no_kk?: string;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string; // "YYYY-MM-DD"
  jenis_kelamin: "Laki-laki" | "Perempuan";
  agama: string;
  pendidikan?: string;
  pekerjaan: string;
  status_perkawinan: "Belum Kawin" | "Kawin" | "Cerai Hidup" | "Cerai Mati";
  hub_keluarga: string;
  pedukuhan: string;
  rt: string;
  rw: string;
  nama_ketua_rt?: string;
  nama_ketua_rw?: string;
  nama_ayah?: string;
  nama_ibu?: string;
}

export interface JenisSuratItem {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  nomor_format: string;
  melibatkan_pihak_luar: boolean;
  urutan: number;
}

export interface JenisSuratDetail extends JenisSuratItem {
  fields_tambahan: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
  template_blade: string;
}

export interface KalurahanSettings {
  nama_kelurahan: string;
  nama_kapanewon: string;
  nama_kabupaten: string;
  nama_provinsi: string;
  nama_lengkap: string;
  nama_lurah: string;
  nip_lurah: string;
  alamat: string;
  kode_pos: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo_path?: string;
  ttd_lurah_path?: string;
}

/**
 * Payload POST /api/surat
 * - penduduk_id: ID dari DB penduduk (required)
 * - jenis_surat_kode: kode seperti "DOMISILI", "TIDAK_MAMPU", "NIKAH_L"
 * - langsung_terbit: true → status "terbit" + nomor digenerate, false → "draft"
 * - data_tambahan: field dinamis sesuai jenis surat (lihat fields_tambahan di JenisSuratDetail)
 */
export interface CreateSuratPayload {
  penduduk_id: number;
  jenis_surat_kode: string;
  langsung_terbit: boolean;
  data_tambahan: Record<string, string | number | boolean>;
}

export interface SuratCreated {
  id: number;
  nomor_surat: string | null; // null jika draft
  status: "terbit" | "draft";
  jenis_surat: string;
  penduduk: string;
  dibuat_pada: string;
}

export interface SuratDetail {
  id: number;
  nomor_surat: string | null;
  status: "terbit" | "draft";
  jenis_surat: string;
  kategori: string;
  penduduk: {
    nik: string;
    nama_lengkap: string;
    pedukuhan: string;
  };
  data_tambahan: Record<string, unknown>;
  data_pihak_luar: Record<string, unknown> | null;
  ttd: {
    atas_nama: string;
    jabatan: string;
    nip: string;
  };
  dibuat_oleh: string;
  dibuat_pada: string;
  dicetak_at: string | null;
}

/**
 * Item di GET /api/register
 * Field-field FLAT (bukan nested object pemohon)
 */
export interface RegisterItem {
  id: number;
  nomor_register: string;
  tanggal: string; // format "26/04/2026"
  jenis_pelayanan: string;
  nomor_surat: string;
  surat_id: number | null;
  jenis_surat_kode: string | null;
  nama_pemohon: string;
  nik_pemohon: string;
  pedukuhan: string;
  petugas: string;
  keterangan: string | null;
}

export interface RegisterUpdatePayload {
  jenis_pelayanan?: string;
  tanggal_pelayanan?: string; // "YYYY-MM-DD"
  keterangan?: string | null;
  pedukuhan_pemohon?: string;
}

export interface RegisterListParams {
  dari?: string;      // "2026-01-01"
  sampai?: string;    // "2026-12-31"
  pedukuhan?: string;
  jenis?: string;
  per_page?: number;
  page?: number;
}

export interface RegisterListResponse {
  data: RegisterItem[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface RegisterRekap {
  tahun: number;
  total: number;
  per_jenis: Array<{ jenis: string; jumlah: number }>;
  per_pedukuhan: Array<{ pedukuhan: string; jumlah: number }>;
  per_bulan: Array<{ bulan: string; jumlah: number }>;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: "admin" | "petugas";
  is_active: boolean;
  last_login_at: string | null;
  created_at?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: "admin" | "petugas";
}

export default api;