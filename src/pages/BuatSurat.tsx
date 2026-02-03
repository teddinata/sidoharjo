import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JENIS_SURAT, AGAMA_LIST, PEKERJAAN_LIST, STATUS_PERKAWINAN_LIST, PADUKUHAN_LIST } from "@/types/surat";
import { ChevronRight, FileText, Printer, Save, Eye } from "lucide-react";
import { toast } from "sonner";

const BuatSurat = () => {
  const { jenis } = useParams<{ jenis: string }>();
  const navigate = useNavigate();
  const jenisInfo = JENIS_SURAT.find(s => s.id === jenis);

  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    pekerjaan: "",
    alamat: "",
    rt: "",
    rw: "",
    padukuhan: "",
    statusPerkawinan: "",
    kewarganegaraan: "Indonesia",
    keperluan: "",
    keterangan: "",
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate nomor surat
    const nomorSurat = `00${Math.floor(Math.random() * 100)}/${jenis?.toUpperCase()}/II/2026`;
    toast.success(`Surat berhasil dibuat dengan nomor: ${nomorSurat}`);
    setShowPreview(true);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Mencetak surat...");
  };

  if (!jenisInfo) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Jenis surat tidak ditemukan</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Buat Surat</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{jenisInfo.nama}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{jenisInfo.nama}</h1>
              <p className="text-muted-foreground">{jenisInfo.deskripsi}</p>
            </div>
            {showPreview && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        {!showPreview ? (
          /* Form */
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Pribadi */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Pribadi Pemohon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="nik">NIK *</Label>
                      <Input
                        id="nik"
                        placeholder="Masukkan 16 digit NIK"
                        value={formData.nik}
                        onChange={(e) => handleChange("nik", e.target.value)}
                        maxLength={16}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        placeholder="Masukkan nama lengkap"
                        value={formData.nama}
                        onChange={(e) => handleChange("nama", e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tempatLahir">Tempat Lahir *</Label>
                        <Input
                          id="tempatLahir"
                          placeholder="Kota/Kabupaten"
                          value={formData.tempatLahir}
                          onChange={(e) => handleChange("tempatLahir", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="tanggalLahir">Tanggal Lahir *</Label>
                        <Input
                          id="tanggalLahir"
                          type="date"
                          value={formData.tanggalLahir}
                          onChange={(e) => handleChange("tanggalLahir", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="jenisKelamin">Jenis Kelamin *</Label>
                      <Select value={formData.jenisKelamin} onValueChange={(v) => handleChange("jenisKelamin", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="agama">Agama *</Label>
                        <Select value={formData.agama} onValueChange={(v) => handleChange("agama", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih agama" />
                          </SelectTrigger>
                          <SelectContent>
                            {AGAMA_LIST.map((agama) => (
                              <SelectItem key={agama} value={agama}>{agama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="statusPerkawinan">Status Perkawinan *</Label>
                        <Select value={formData.statusPerkawinan} onValueChange={(v) => handleChange("statusPerkawinan", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_PERKAWINAN_LIST.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pekerjaan">Pekerjaan *</Label>
                      <Select value={formData.pekerjaan} onValueChange={(v) => handleChange("pekerjaan", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pekerjaan" />
                        </SelectTrigger>
                        <SelectContent>
                          {PEKERJAAN_LIST.map((pekerjaan) => (
                            <SelectItem key={pekerjaan} value={pekerjaan}>{pekerjaan}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Alamat */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Alamat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="alamat">Alamat Lengkap *</Label>
                    <Textarea
                      id="alamat"
                      placeholder="Masukkan alamat lengkap"
                      value={formData.alamat}
                      onChange={(e) => handleChange("alamat", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="rt">RT *</Label>
                      <Input
                        id="rt"
                        placeholder="01"
                        value={formData.rt}
                        onChange={(e) => handleChange("rt", e.target.value)}
                        maxLength={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rw">RW *</Label>
                      <Input
                        id="rw"
                        placeholder="01"
                        value={formData.rw}
                        onChange={(e) => handleChange("rw", e.target.value)}
                        maxLength={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="padukuhan">Padukuhan *</Label>
                      <Select value={formData.padukuhan} onValueChange={(v) => handleChange("padukuhan", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {PADUKUHAN_LIST.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="kewarganegaraan">Kewarganegaraan</Label>
                    <Input
                      id="kewarganegaraan"
                      value={formData.kewarganegaraan}
                      onChange={(e) => handleChange("kewarganegaraan", e.target.value)}
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Keperluan */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Keperluan Surat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="keperluan">Keperluan Pembuatan Surat *</Label>
                    <Input
                      id="keperluan"
                      placeholder="Contoh: Untuk melamar pekerjaan, untuk pengajuan kredit, dll"
                      value={formData.keperluan}
                      onChange={(e) => handleChange("keperluan", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="keterangan">Keterangan Tambahan</Label>
                    <Textarea
                      id="keterangan"
                      placeholder="Keterangan tambahan jika diperlukan"
                      value={formData.keterangan}
                      onChange={(e) => handleChange("keterangan", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Batal
              </Button>
              <Button type="button" variant="secondary">
                <Save className="w-4 h-4 mr-2" />
                Simpan Draft
              </Button>
              <Button type="submit">
                <Eye className="w-4 h-4 mr-2" />
                Preview Surat
              </Button>
            </div>
          </form>
        ) : (
          /* Preview */
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              {/* Kop Surat */}
              <div className="text-center border-b-2 border-foreground pb-4 mb-6">
                <p className="text-sm font-medium">PEMERINTAH KABUPATEN KULON PROGO</p>
                <p className="text-sm font-medium">KAPANEWON GALUR</p>
                <h2 className="text-xl font-bold mt-1">KALURAHAN SIDOHARJO</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Alamat: Jl. Raya Sidoharjo, Galur, Kulon Progo, DIY 55661
                </p>
              </div>

              {/* Judul Surat */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold underline">{jenisInfo.nama.toUpperCase()}</h3>
                <p className="text-sm">Nomor: 00{Math.floor(Math.random() * 100)}/{jenis?.toUpperCase()}/II/2026</p>
              </div>

              {/* Isi Surat */}
              <div className="space-y-4 text-sm leading-relaxed">
                <p>Yang bertanda tangan di bawah ini, Lurah Sidoharjo Kapanewon Galur Kabupaten Kulon Progo, menerangkan bahwa:</p>
                
                <table className="w-full">
                  <tbody>
                    <tr><td className="w-40 py-1">Nama</td><td>: {formData.nama || "[Nama Lengkap]"}</td></tr>
                    <tr><td className="py-1">NIK</td><td>: {formData.nik || "[NIK]"}</td></tr>
                    <tr><td className="py-1">Tempat, Tgl Lahir</td><td>: {formData.tempatLahir || "[Tempat]"}, {formData.tanggalLahir ? new Date(formData.tanggalLahir).toLocaleDateString("id-ID") : "[Tanggal]"}</td></tr>
                    <tr><td className="py-1">Jenis Kelamin</td><td>: {formData.jenisKelamin || "[Jenis Kelamin]"}</td></tr>
                    <tr><td className="py-1">Agama</td><td>: {formData.agama || "[Agama]"}</td></tr>
                    <tr><td className="py-1">Pekerjaan</td><td>: {formData.pekerjaan || "[Pekerjaan]"}</td></tr>
                    <tr><td className="py-1">Status Perkawinan</td><td>: {formData.statusPerkawinan || "[Status]"}</td></tr>
                    <tr><td className="py-1">Kewarganegaraan</td><td>: {formData.kewarganegaraan}</td></tr>
                    <tr><td className="py-1">Alamat</td><td>: {formData.alamat || "[Alamat]"} RT {formData.rt || "00"}/RW {formData.rw || "00"}, Padukuhan {formData.padukuhan || "[Padukuhan]"}</td></tr>
                  </tbody>
                </table>

                <p className="mt-4">
                  Berdasarkan data yang ada, orang tersebut di atas adalah benar warga Kalurahan Sidoharjo 
                  Kapanewon Galur Kabupaten Kulon Progo.
                </p>

                <p>
                  Surat keterangan ini dibuat untuk keperluan: <strong>{formData.keperluan || "[Keperluan]"}</strong>
                </p>

                <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
              </div>

              {/* Tanda Tangan */}
              <div className="mt-8 flex justify-end">
                <div className="text-center">
                  <p className="text-sm">Sidoharjo, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="text-sm font-medium mt-1">LURAH SIDOHARJO</p>
                  <div className="h-20"></div>
                  <p className="text-sm font-bold underline">H. SUPRIYANTO, S.Pd</p>
                  <p className="text-xs">NIP. 19680515 199003 1 005</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default BuatSurat;
