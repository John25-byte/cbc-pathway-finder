import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const StudentAnalytics = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      if (roles) {
        const ids = roles.map((r: any) => r.user_id);
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
        if (profiles) setStudents(profiles.map((p: any) => ({ user_id: p.user_id, full_name: p.full_name })));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const fetch = async () => {
      const { data } = await supabase.from("results").select("score, subjects(name)").eq("student_id", selectedStudent);
      if (data) setResults(data.map((r: any) => ({ name: r.subjects?.name, score: Number(r.score) })));
    };
    fetch();
  }, [selectedStudent]);

  const avg = results.length ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) : 0;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Student Analytics</h1>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.user_id} value={s.user_id}>{s.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent && results.length > 0 && (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Average</p><p className="text-3xl font-bold">{avg}%</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Highest</p><p className="text-3xl font-bold text-pathway-social">{Math.max(...results.map(r => r.score))}%</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Lowest</p><p className="text-3xl font-bold text-pathway-arts">{Math.min(...results.map(r => r.score))}%</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Subject Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {results.map((r, i) => (
                        <Cell key={i} fill={r.score >= 75 ? "hsl(142,71%,45%)" : r.score >= 50 ? "hsl(217,91%,60%)" : "hsl(25,95%,53%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentAnalytics;
