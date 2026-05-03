import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useJenisSurat } from "@/hooks/useJenisSurat";
import { SuratSubNav } from "@/components/surat/SuratSubNav";
import { Loader2 } from "lucide-react";
import { 
  Home, 
  ArrowRightLeft, 
  Baby, 
  HeartOff, 
  ChevronRight
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  ArrowRightLeft,
  Baby,
  HeartOff,
};

const SuratKependudukan = () => {
  const { flat, isLoading } = useJenisSurat();
  const kependudukanSurat = flat.filter(s => s.kategori === "Kependudukan" || s.kategori === "Kelahiran & Kematian" || s.kategori.toLowerCase().includes("kependudukan"));

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
            <span className="text-foreground">Kependudukan</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Surat Kependudukan</h1>
          <p className="text-muted-foreground">Pilih jenis surat kependudukan yang ingin dibuat</p>
        </div>

        {/* Sub-navigation */}
        <SuratSubNav />

        {/* Letter Types Grid */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : kependudukanSurat.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border rounded-xl border-dashed">
            Belum ada layanan surat kependudukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kependudukanSurat.map((item) => {
              const Icon = iconMap[item.kategori] || Home;
              return (
                <Link key={item.kode} to={`/surat/buat/${item.kode}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                    <CardHeader className="flex flex-row items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{item.nama}</CardTitle>
                        <p className="text-sm text-muted-foreground">{item.nomor_format}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SuratKependudukan;
