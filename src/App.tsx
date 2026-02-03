import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SuratKependudukan from "./pages/SuratKependudukan";
import SuratUsaha from "./pages/SuratUsaha";
import SuratLainnya from "./pages/SuratLainnya";
import BuatSurat from "./pages/BuatSurat";
import ArsipData from "./pages/ArsipData";
import Laporan from "./pages/Laporan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/surat/kependudukan" element={<SuratKependudukan />} />
          <Route path="/surat/usaha" element={<SuratUsaha />} />
          <Route path="/surat/lainnya" element={<SuratLainnya />} />
          <Route path="/surat/buat/:jenis" element={<BuatSurat />} />
          <Route path="/arsip" element={<ArsipData />} />
          <Route path="/laporan" element={<Laporan />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
