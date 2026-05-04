import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SuratKependudukan from "./pages/SuratKependudukan";
import SuratUsaha from "./pages/SuratUsaha";
import SuratLainnya from "./pages/SuratLainnya";
import BuatSurat from "./pages/BuatSurat";
import ArsipData from "./pages/ArsipData";
import Laporan from "./pages/Laporan";
import DataPenduduk from "./pages/DataPenduduk";
import Pengaturan from "./pages/Pengaturan";
import ManajemenUser from "./pages/ManajemenUser";
import NotFound from "./pages/NotFound";
import { FeedbackWidget } from "@/components/FeedbackWidget";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            {/* Protected — butuh login */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/surat/kependudukan" element={<SuratKependudukan />} />
              <Route path="/surat/usaha" element={<SuratUsaha />} />
              <Route path="/surat/lainnya" element={<SuratLainnya />} />
              <Route path="/surat/buat/:jenis" element={<BuatSurat />} />
              <Route path="/arsip" element={<ArsipData />} />
              <Route path="/laporan" element={<Laporan />} />
              <Route path="/penduduk" element={<DataPenduduk />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
              <Route path="/users" element={<ManajemenUser />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackWidget />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;