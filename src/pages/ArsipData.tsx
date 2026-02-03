import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockSurat, getJenisSuratInfo, formatTanggalSingkat } from "@/data/mockData";
import { JENIS_SURAT } from "@/types/surat";
import { Search, Filter, Download, Eye, ChevronRight, ChevronLeft, FileText } from "lucide-react";

const ArsipData = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter data
  const filteredData = mockSurat.filter((surat) => {
    const matchesSearch = 
      surat.pemohon.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surat.pemohon.nik.includes(searchQuery) ||
      surat.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJenis = filterJenis === "all" || surat.jenisSurat === filterJenis;
    const matchesStatus = filterStatus === "all" || surat.status === filterStatus;
    
    return matchesSearch && matchesJenis && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Arsip Data</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Arsip Data Surat</h1>
              <p className="text-muted-foreground">Cari dan kelola arsip surat yang telah dibuat</p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NIK, atau nomor surat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterJenis} onValueChange={setFilterJenis}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Jenis Surat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    {JENIS_SURAT.map((jenis) => (
                      <SelectItem key={jenis.id} value={jenis.id}>
                        {jenis.nama.replace("Surat Keterangan ", "").replace("Surat Pengantar ", "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Daftar Surat ({filteredData.length} data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Surat</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Pemohon</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Jenis Surat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((surat) => {
                    const jenisInfo = getJenisSuratInfo(surat.jenisSurat);
                    return (
                      <TableRow key={surat.id}>
                        <TableCell className="font-medium">{surat.nomorSurat}</TableCell>
                        <TableCell>{formatTanggalSingkat(surat.tanggal)}</TableCell>
                        <TableCell>{surat.pemohon.nama}</TableCell>
                        <TableCell className="font-mono text-sm">{surat.pemohon.nik}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {jenisInfo?.nama.replace("Surat Keterangan ", "").replace("Surat Pengantar ", "")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={surat.status === "selesai" ? "default" : surat.status === "draft" ? "secondary" : "destructive"}
                          >
                            {surat.status.charAt(0).toUpperCase() + surat.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Lihat
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada data yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-2">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ArsipData;
