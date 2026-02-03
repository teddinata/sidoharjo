import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthlyData = [
  { name: "Agt", jumlah: 52 },
  { name: "Sep", jumlah: 40 },
  { name: "Okt", jumlah: 35 },
  { name: "Nov", jumlah: 42 },
  { name: "Des", jumlah: 38 },
  { name: "Jan", jumlah: 45 },
];

const categoryData = [
  { name: "Domisili", value: 35, color: "hsl(222, 47%, 20%)" },
  { name: "SKTM", value: 22, color: "hsl(45, 93%, 47%)" },
  { name: "SKU", value: 18, color: "hsl(199, 89%, 48%)" },
  { name: "SKCK", value: 12, color: "hsl(142, 76%, 36%)" },
  { name: "Lainnya", value: 13, color: "hsl(215, 16%, 47%)" },
];

export function MonthlyChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Tren Pembuatan Surat</CardTitle>
        <p className="text-sm text-muted-foreground">6 bulan terakhir</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar 
                dataKey="jumlah" 
                fill="hsl(222, 47%, 20%)" 
                radius={[4, 4, 0, 0]}
                name="Jumlah Surat"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Jenis Surat Terbanyak</CardTitle>
        <p className="text-sm text-muted-foreground">Bulan ini</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
