import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Loader2, KeyRound,
  ToggleLeft, ToggleRight, ShieldAlert, Users,
} from "lucide-react";
import { userApi, UserItem, UserPayload } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function formatDate(str: string | null) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const emptyForm: UserPayload = { name: "", email: "", role: "petugas", password: "", password_confirmation: "" };

export default function ManajemenUser() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === "admin";
  const qc = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [passTarget, setPassTarget] = useState<UserItem | null>(null);
  const [form, setForm] = useState<UserPayload>(emptyForm);
  const [passForm, setPassForm] = useState({ password: "", password_confirmation: "" });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.list({ per_page: 50 }).then((r) => r.data),
    enabled: isAdmin,
  });

  const users = usersData?.data ?? [];

  const setField = (key: keyof UserPayload, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (u: UserItem) => {
    setEditTarget(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: "", password_confirmation: "" });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      editTarget
        ? userApi.update(editTarget.id, { name: form.name, email: form.email, role: form.role }).then((r) => r.data)
        : userApi.create(form).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["users"] });
      setFormOpen(false);
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0] as string[];
        toast.error(first[0]);
      } else {
        toast.error(err?.response?.data?.message ?? "Gagal menyimpan.");
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => userApi.toggleAktif(id).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message ?? "Status diperbarui.");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Gagal mengubah status."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.destroy(id).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message ?? "User dihapus.");
      qc.invalidateQueries({ queryKey: ["users"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Gagal menghapus.");
      setDeleteTarget(null);
    },
  });

  const passMutation = useMutation({
    mutationFn: () => userApi.gantiPassword(passTarget!.id, passForm).then((r) => r.data),
    onSuccess: () => {
      toast.success("Password berhasil diperbarui.");
      setPassTarget(null);
      setPassForm({ password: "", password_confirmation: "" });
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0] as string[];
        toast.error(first[0]);
      } else {
        toast.error(err?.response?.data?.message ?? "Gagal mengubah password.");
      }
    },
  });

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <ShieldAlert className="w-14 h-14 text-destructive/40" />
          <div>
            <p className="font-semibold text-lg">Akses Ditolak</p>
            <p className="text-sm text-muted-foreground">Hanya Admin yang dapat mengakses halaman ini.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Manajemen User</h1>
              <p className="text-muted-foreground text-sm">Kelola akun operator dan admin sistem</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Tambah User
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Login Terakhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Belum ada user.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {u.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          {u.id === me?.id && (
                            <p className="text-xs text-muted-foreground">Anda</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}
                        className={u.role === "admin" ? "bg-violet-500/15 text-violet-600 border-violet-500/30" : ""}>
                        {u.role === "admin" ? "Admin" : "Petugas"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(u.last_login_at)}</TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? "default" : "secondary"}
                        className={u.is_active ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : ""}>
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(u)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Ganti Password" onClick={() => setPassTarget(u)}>
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          title={u.is_active ? "Nonaktifkan" : "Aktifkan"}
                          onClick={() => toggleMutation.mutate(u.id)}
                          disabled={toggleMutation.isPending || u.id === me?.id}>
                          {u.is_active
                            ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                            : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Hapus"
                          onClick={() => setDeleteTarget(u)}
                          disabled={u.id === me?.id}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Form Modal (Tambah / Edit) ─────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit User" : "Tambah User Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="u_name" className="text-xs text-muted-foreground">Nama Lengkap *</Label>
              <Input id="u_name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Nama user" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u_email" className="text-xs text-muted-foreground">Email *</Label>
              <Input id="u_email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="email@contoh.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u_role" className="text-xs text-muted-foreground">Role *</Label>
              <Select value={form.role} onValueChange={(v) => setField("role", v)}>
                <SelectTrigger id="u_role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="petugas">Petugas</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editTarget && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="u_pass" className="text-xs text-muted-foreground">Password *</Label>
                  <Input id="u_pass" type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} placeholder="Min. 8 karakter" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u_pass2" className="text-xs text-muted-foreground">Konfirmasi Password *</Label>
                  <Input id="u_pass2" type="password" value={form.password_confirmation} onChange={(e) => setField("password_confirmation", e.target.value)} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="min-w-24">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Ganti Password Modal ───────────────────────────────────── */}
      <Dialog open={!!passTarget} onOpenChange={(v) => !v && setPassTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ganti Password — {passTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="np" className="text-xs text-muted-foreground">Password Baru *</Label>
              <Input id="np" type="password" value={passForm.password}
                onChange={(e) => setPassForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Min. 8 karakter" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np2" className="text-xs text-muted-foreground">Konfirmasi Password *</Label>
              <Input id="np2" type="password" value={passForm.password_confirmation}
                onChange={(e) => setPassForm((p) => ({ ...p, password_confirmation: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPassTarget(null)}>Batal</Button>
            <Button onClick={() => passMutation.mutate()} disabled={passMutation.isPending} className="min-w-24">
              {passMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Konfirmasi Hapus ───────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Hapus akun <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? Tindakan ini permanen.
          </p>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
