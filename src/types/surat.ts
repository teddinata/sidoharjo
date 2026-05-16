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

export type JenisSurat = string;


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
  "Nglambur",
  "Nyemani",
  "Wonogiri",
  "Madigondo",
  "Wonotawang",
  "Munggang Lor",
  "Munggang Wetan",
  "Gorolangu",
  "Tetes",
  "Sumoroto",
  "Nungkep",
  "Tukmudal",
  "Keweron",
  "Sulur",
  "Bleder",
  "Kedokan",
  "Sebo",
  "Gebang",
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
