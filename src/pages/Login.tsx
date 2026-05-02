import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, LogIn } from "lucide-react";
import { APP_VERSION, APP_NAME } from "@/lib/version";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Email atau password salah. Silakan coba lagi.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — decorative navy */}
      <div className="hidden lg:flex lg:w-1/2 gradient-navy flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/3" />

        {/* Logo & title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center shadow-lg">
              <span className="text-navy font-bold text-xl">S</span>
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium">Kalurahan</p>
              <p className="text-white font-bold text-lg leading-tight">Sidoharjo</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Sistem Pelayanan
            <br />
            <span className="text-gold">Digital Desa</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Platform administrasi modern untuk meningkatkan efisiensi pelayanan
            kependudukan Kalurahan Sidoharjo.
          </p>
        </div>

        {/* Info cards */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { label: "Jenis Surat", value: "10+" },
            { label: "Pelayanan Cepat", value: "Digital" },
            { label: "Data Aman", value: "Terenkripsi" },
            { label: "Arsip Mudah", value: "Dicari" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10"
            >
              <p className="text-gold font-bold text-lg">{item.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Kalurahan Sidoharjo, Kapanewon Samigaluh, Kabupaten Kulon Progo, DIY
          </p>
          <p className="text-white/30 text-xs mt-1">
            {APP_NAME} v{APP_VERSION}
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Kalurahan</p>
            <p className="font-bold text-foreground">Sidoharjo</p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Selamat Datang
            </h2>
            <p className="text-muted-foreground text-sm">
              Masuk untuk mengakses sistem pelayanan digital
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error alert */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sidoharjo.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Memverifikasi...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk
                </div>
              )}
            </Button>
          </form>

          {/* Hint untuk development */}
          {/* <div className="mt-8 rounded-lg bg-muted/50 border border-border px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Akun Default (Development)
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              admin@sidoharjo.go.id / password
            </p>
          </div> */}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Lupa password? Hubungi administrator desa.
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground/50">
            {APP_NAME} v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;