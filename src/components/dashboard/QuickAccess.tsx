import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJenisSurat } from "@/hooks/useJenisSurat";
import { Loader2 } from "lucide-react";
import { 
  Home, 
  ArrowRightLeft, 
  Baby, 
  HeartOff, 
  Store, 
  Wallet, 
  HandHeart, 
  Shield, 
  Heart, 
  Search 
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  ArrowRightLeft,
  Baby,
  HeartOff,
  Store,
  Wallet,
  HandHeart,
  Shield,
  Heart,
  Search,
};

export function QuickAccess() {
  const { flat, isLoading } = useJenisSurat();
  const quickAccessItems = flat.slice(0, 5);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Akses Cepat</CardTitle>
        <p className="text-sm text-muted-foreground">Jenis surat yang sering digunakan</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickAccessItems.map((item) => {
              const Icon = iconMap[item.kategori] || Home;
              return (
                <Link
                  key={item.kode}
                  to={`/surat/buat/${item.kode}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all"
                >
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium leading-tight">{item.nama.replace("Surat Keterangan ", "")}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
