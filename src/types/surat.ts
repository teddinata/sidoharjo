// Data types untuk Sistem Pelayanan Desa

export interface Penduduk {
  id: string;
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  agama: string;
  pekerjaan: string;
  alamat: string;
  rt: string;
  rw: string;
  padukuhan: string;
  statusPerkawinan: string;
  kewarganegaraan: string;
}

export interface Surat {
  id: string;
  nomorSurat: string;
  jenisSurat: JenisSurat;
  tanggal: string;
  pemohon: Penduduk;
  keterangan?: string;
  status: "draft" | "selesai" | "dibatalkan";
  createdAt: string;
  updatedAt: string;
}

export type JenisSurat = 
  | "domisili"
  | "pindah"
  | "kelahiran"
  | "kematian"
  | "sku"
  | "penghasilan"
  | "sktm"
  | "skck"
  | "nikah"
  | "kehilangan";

export interface JenisSuratInfo {
  id: JenisSurat;
  nama: string;
  deskripsi: string;
  kategori: "kependudukan" | "usaha" | "lainnya";
  icon: string;
}

export const JENIS_SURAT: JenisSuratInfo[] = [
  {
    id: "domisili",
    nama: "Surat Keterangan Domisili",
    deskripsi: "Keterangan tempat tinggal penduduk",
    kategori: "kependudukan",
    icon: "Home"
  },
  {
    id: "pindah",
    nama: "Surat Keterangan Pindah",
    deskripsi: "Keterangan perpindahan penduduk",
    kategori: "kependudukan",
    icon: "ArrowRightLeft"
  },
  {
    id: "kelahiran",
    nama: "Surat Keterangan Kelahiran",
    deskripsi: "Keterangan kelahiran bayi",
    kategori: "kependudukan",
    icon: "Baby"
  },
  {
    id: "kematian",
    nama: "Surat Keterangan Kematian",
    deskripsi: "Keterangan meninggal dunia",
    kategori: "kependudukan",
    icon: "HeartOff"
  },
  {
    id: "sku",
    nama: "Surat Keterangan Usaha",
    deskripsi: "Keterangan memiliki usaha",
    kategori: "usaha",
    icon: "Store"
  },
  {
    id: "penghasilan",
    nama: "Surat Keterangan Penghasilan",
    deskripsi: "Keterangan penghasilan/pendapatan",
    kategori: "usaha",
    icon: "Wallet"
  },
  {
    id: "sktm",
    nama: "Surat Keterangan Tidak Mampu",
    deskripsi: "Keterangan keluarga tidak mampu",
    kategori: "usaha",
    icon: "HandHeart"
  },
  {
    id: "skck",
    nama: "Surat Pengantar SKCK",
    deskripsi: "Pengantar pembuatan SKCK",
    kategori: "lainnya",
    icon: "Shield"
  },
  {
    id: "nikah",
    nama: "Surat Pengantar Nikah",
    deskripsi: "Pengantar pendaftaran nikah",
    kategori: "lainnya",
    icon: "Heart"
  },
  {
    id: "kehilangan",
    nama: "Surat Keterangan Kehilangan",
    deskripsi: "Keterangan kehilangan barang/dokumen",
    kategori: "lainnya",
    icon: "Search"
  }
];

export interface StatistikHarian {
  tanggal: string;
  jumlah: number;
}

export interface StatistikBulanan {
  bulan: string;
  jumlah: number;
  perJenis: Record<JenisSurat, number>;
}

export const PADUKUHAN_LIST = [
  "Sidoharjo",
  "Kebonrejo",
  "Sumberagung",
  "Kalibening",
  "Tegalsari"
];

export const AGAMA_LIST = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu"
];

export const PEKERJAAN_LIST = [
  "Petani",
  "Buruh",
  "Pedagang",
  "Wiraswasta",
  "PNS",
  "Karyawan Swasta",
  "Ibu Rumah Tangga",
  "Pelajar/Mahasiswa",
  "Tidak Bekerja",
  "Lainnya"
];

export const STATUS_PERKAWINAN_LIST = [
  "Belum Kawin",
  "Kawin",
  "Cerai Hidup",
  "Cerai Mati"
];
