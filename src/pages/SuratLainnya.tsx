import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { JENIS_SURAT } from "@/types/surat";
import { 
  Shield, 
  Heart, 
  Search, 
  ChevronRight
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Heart,
  Search,
};

const lainnyaSurat = JENIS_SURAT.filter(s => s.kategori === "lainnya");

const SuratLainnya = () => {
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
            <span className="text-foreground">Lainnya</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Surat Lainnya</h1>
          <p className="text-muted-foreground">Pilih jenis surat lainnya yang ingin dibuat</p>
        </div>

        {/* Letter Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lainnyaSurat.map((item) => {
            const Icon = iconMap[item.icon] || Shield;
            return (
              <Link key={item.id} to={`/surat/buat/${item.id}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                      <Icon className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{item.nama}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.deskripsi}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default SuratLainnya;
