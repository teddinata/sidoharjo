import { Surat, Penduduk, StatistikBulanan, JENIS_SURAT } from "@/types/surat";

// Mock data untuk demo/presentasi

export const mockPenduduk: Penduduk[] = [
  {
    id: "1",
    nik: "3401234567890001",
    nama: "Ahmad Suryanto",
    tempatLahir: "Kulon Progo",
    tanggalLahir: "1985-05-15",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    pekerjaan: "Petani",
    alamat: "Dusun Sidoharjo RT 01/RW 02",
    rt: "01",
    rw: "02",
    padukuhan: "Sidoharjo",
    statusPerkawinan: "Kawin",
    kewarganegaraan: "Indonesia"
  },
  {
    id: "2",
    nik: "3401234567890002",
    nama: "Siti Rahayu",
    tempatLahir: "Yogyakarta",
    tanggalLahir: "1990-08-22",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    pekerjaan: "Pedagang",
    alamat: "Dusun Kebonrejo RT 03/RW 01",
    rt: "03",
    rw: "01",
    padukuhan: "Kebonrejo",
    statusPerkawinan: "Kawin",
    kewarganegaraan: "Indonesia"
  },
  {
    id: "3",
    nik: "3401234567890003",
    nama: "Budi Santoso",
    tempatLahir: "Kulon Progo",
    tanggalLahir: "1978-12-03",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    pekerjaan: "Wiraswasta",
    alamat: "Dusun Sumberagung RT 02/RW 03",
    rt: "02",
    rw: "03",
    padukuhan: "Sumberagung",
    statusPerkawinan: "Kawin",
    kewarganegaraan: "Indonesia"
  },
  {
    id: "4",
    nik: "3401234567890004",
    nama: "Dewi Lestari",
    tempatLahir: "Bantul",
    tanggalLahir: "1995-03-10",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    pekerjaan: "Karyawan Swasta",
    alamat: "Dusun Kalibening RT 01/RW 01",
    rt: "01",
    rw: "01",
    padukuhan: "Kalibening",
    statusPerkawinan: "Belum Kawin",
    kewarganegaraan: "Indonesia"
  },
  {
    id: "5",
    nik: "3401234567890005",
    nama: "Rudi Hartono",
    tempatLahir: "Kulon Progo",
    tanggalLahir: "1982-07-28",
    jenisKelamin: "Laki-laki",
    agama: "Kristen",
    pekerjaan: "PNS",
    alamat: "Dusun Tegalsari RT 04/RW 02",
    rt: "04",
    rw: "02",
    padukuhan: "Tegalsari",
    statusPerkawinan: "Kawin",
    kewarganegaraan: "Indonesia"
  }
];

export const mockSurat: Surat[] = [
  {
    id: "1",
    nomorSurat: "001/SKD/I/2026",
    jenisSurat: "domisili",
    tanggal: "2026-01-15",
    pemohon: mockPenduduk[0],
    keterangan: "Untuk keperluan administrasi",
    status: "selesai",
    createdAt: "2026-01-15T08:30:00",
    updatedAt: "2026-01-15T08:30:00"
  },
  {
    id: "2",
    nomorSurat: "002/SKU/I/2026",
    jenisSurat: "sku",
    tanggal: "2026-01-16",
    pemohon: mockPenduduk[1],
    keterangan: "Usaha toko kelontong",
    status: "selesai",
    createdAt: "2026-01-16T09:00:00",
    updatedAt: "2026-01-16T09:00:00"
  },
  {
    id: "3",
    nomorSurat: "003/SKTM/I/2026",
    jenisSurat: "sktm",
    tanggal: "2026-01-18",
    pemohon: mockPenduduk[2],
    keterangan: "Untuk beasiswa pendidikan anak",
    status: "selesai",
    createdAt: "2026-01-18T10:15:00",
    updatedAt: "2026-01-18T10:15:00"
  },
  {
    id: "4",
    nomorSurat: "004/SKD/I/2026",
    jenisSurat: "domisili",
    tanggal: "2026-01-20",
    pemohon: mockPenduduk[3],
    keterangan: "Untuk melamar pekerjaan",
    status: "selesai",
    createdAt: "2026-01-20T11:00:00",
    updatedAt: "2026-01-20T11:00:00"
  },
  {
    id: "5",
    nomorSurat: "005/SKCK/I/2026",
    jenisSurat: "skck",
    tanggal: "2026-01-22",
    pemohon: mockPenduduk[4],
    keterangan: "Untuk keperluan pekerjaan",
    status: "selesai",
    createdAt: "2026-01-22T14:30:00",
    updatedAt: "2026-01-22T14:30:00"
  },
  {
    id: "6",
    nomorSurat: "006/SKU/I/2026",
    jenisSurat: "sku",
    tanggal: "2026-01-25",
    pemohon: mockPenduduk[0],
    keterangan: "Usaha pertanian",
    status: "selesai",
    createdAt: "2026-01-25T08:00:00",
    updatedAt: "2026-01-25T08:00:00"
  },
  {
    id: "7",
    nomorSurat: "007/SKTM/I/2026",
    jenisSurat: "sktm",
    tanggal: "2026-01-28",
    pemohon: mockPenduduk[1],
    keterangan: "Untuk bantuan sosial",
    status: "selesai",
    createdAt: "2026-01-28T09:30:00",
    updatedAt: "2026-01-28T09:30:00"
  },
  {
    id: "8",
    nomorSurat: "008/SKD/II/2026",
    jenisSurat: "domisili",
    tanggal: "2026-02-01",
    pemohon: mockPenduduk[2],
    keterangan: "Untuk keperluan bank",
    status: "selesai",
    createdAt: "2026-02-01T10:00:00",
    updatedAt: "2026-02-01T10:00:00"
  },
  {
    id: "9",
    nomorSurat: "009/SKP/II/2026",
    jenisSurat: "penghasilan",
    tanggal: "2026-02-02",
    pemohon: mockPenduduk[3],
    keterangan: "Untuk pengajuan kredit",
    status: "selesai",
    createdAt: "2026-02-02T11:15:00",
    updatedAt: "2026-02-02T11:15:00"
  },
  {
    id: "10",
    nomorSurat: "010/SPN/II/2026",
    jenisSurat: "nikah",
    tanggal: "2026-02-03",
    pemohon: mockPenduduk[4],
    keterangan: "Pengantar ke KUA",
    status: "draft",
    createdAt: "2026-02-03T08:00:00",
    updatedAt: "2026-02-03T08:00:00"
  }
];

export const mockStatistikBulanan: StatistikBulanan[] = [
  {
    bulan: "Januari 2026",
    jumlah: 45,
    perJenis: {
      domisili: 12,
      pindah: 3,
      kelahiran: 5,
      kematian: 2,
      sku: 8,
      penghasilan: 4,
      sktm: 6,
      skck: 3,
      nikah: 1,
      kehilangan: 1
    }
  },
  {
    bulan: "Desember 2025",
    jumlah: 38,
    perJenis: {
      domisili: 10,
      pindah: 2,
      kelahiran: 4,
      kematian: 3,
      sku: 6,
      penghasilan: 5,
      sktm: 4,
      skck: 2,
      nikah: 1,
      kehilangan: 1
    }
  },
  {
    bulan: "November 2025",
    jumlah: 42,
    perJenis: {
      domisili: 11,
      pindah: 4,
      kelahiran: 3,
      kematian: 2,
      sku: 7,
      penghasilan: 6,
      sktm: 5,
      skck: 2,
      nikah: 1,
      kehilangan: 1
    }
  },
  {
    bulan: "Oktober 2025",
    jumlah: 35,
    perJenis: {
      domisili: 9,
      pindah: 2,
      kelahiran: 4,
      kematian: 1,
      sku: 5,
      penghasilan: 4,
      sktm: 6,
      skck: 2,
      nikah: 1,
      kehilangan: 1
    }
  },
  {
    bulan: "September 2025",
    jumlah: 40,
    perJenis: {
      domisili: 10,
      pindah: 3,
      kelahiran: 5,
      kematian: 2,
      sku: 6,
      penghasilan: 5,
      sktm: 5,
      skck: 2,
      nikah: 1,
      kehilangan: 1
    }
  },
  {
    bulan: "Agustus 2025",
    jumlah: 52,
    perJenis: {
      domisili: 14,
      pindah: 5,
      kelahiran: 6,
      kematian: 2,
      sku: 8,
      penghasilan: 6,
      sktm: 6,
      skck: 3,
      nikah: 1,
      kehilangan: 1
    }
  }
];

// Helper functions
export function getJenisSuratInfo(id: string) {
  return JENIS_SURAT.find(j => j.id === id);
}

export function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function formatTanggalSingkat(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function formatWaktu(datetime: string): string {
  return new Date(datetime).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
