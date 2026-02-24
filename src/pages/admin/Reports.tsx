import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Download } from "lucide-react";

const Reports = () => {
  const [pathwayStats, setPathwayStats] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [pRes, aRes] = await Promise.all([
        supabase.from("pathways").select("id, name, color"),
        supabase.from("applications").select(`
          id, status, admin_notes,
          profiles!applications_student_id_fkey(full_name, school),
          chosen:pathways!applications_chosen_pathway_id_fkey(name, color),
          recommended:pathways!applications_recommended_pathway_id_fkey(name),
          recommendations!inner(final_score)
        `),
      ]);

      const pathways = pRes.data || [];
      const apps = aRes.data || [];

      const stats = pathways.map(p => ({
        name: p.name,
        color: p.color,
        count: apps.filter((a: any) => (a.chosen as any)?.name === p.name).length,
        approved: apps.filter((a: any) => (a.chosen as any)?.name === p.name && a.status === "approved").length,
      }));

      setPathwayStats(stats);
      setApplications(apps);
      setLoading(false);
    };
    fetch();
  }, []);

  const exportCSV = () => {
    const headers = "Student,School,Chosen Pathway,Recommended,Score,Status,Notes\n";
    const rows = applications.map((a: any) =>
      `"${(a.profiles as any)?.full_name}","${(a.profiles as any)?.school || ''}","${(a.chosen as any)?.name}","${(a.recommended as any)?.name || ''}","${(a.recommendations as any)?.[0]?.final_score || ''}","${a.status}","${a.admin_notes || ''}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "placement_report.csv";
    a.click();
  };

  const misaligned = applications.filter((a: any) =>
    (a.chosen as any)?.name && (a.recommended as any)?.name && (a.chosen as any)?.name !== (a.recommended as any)?.name
  ).length;

  if (loading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Button onClick={exportCSV} variant="outline"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Applications</p><p className="text-3xl font-bold">{applications.length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Approved</p><p className="text-3xl font-bold text-pathway-social">{applications.filter((a: any) => a.status === "approved").length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Misaligned (Interest ≠ Choice)</p><p className="text-3xl font-bold text-pathway-arts">{misaligned}</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Students per Pathway</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pathwayStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {pathwayStats.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pathwayStats.filter(s => s.count > 0)}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {pathwayStats.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
