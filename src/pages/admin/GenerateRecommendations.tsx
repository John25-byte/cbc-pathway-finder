import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { computeRecommendationsForStudent } from "@/lib/recommendation";
import { Sparkles } from "lucide-react";

const GenerateRecommendations = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");
    const ids = (roles || []).map((r: any) => r.user_id);
    if (!ids.length) { setStudents([]); setLoading(false); return; }

    const [profilesRes, recsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, school").in("user_id", ids),
      supabase
        .from("recommendations")
        .select("student_id, final_score, pathways(name, color)")
        .in("student_id", ids),
    ]);

    const profiles = profilesRes.data || [];
    const recs = recsRes.data || [];
    const merged = profiles.map((p: any) => {
      const studentRecs = recs.filter((r: any) => r.student_id === p.user_id);
      const top = studentRecs.length
        ? studentRecs.reduce((a: any, b: any) => (a.final_score > b.final_score ? a : b))
        : null;
      return { ...p, top };
    });
    setStudents(merged);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const generateOne = async (studentId: string) => {
    setBusyId(studentId);
    try {
      const top = await computeRecommendationsForStudent(studentId);
      toast.success("Recommendation generated");
      await fetchStudents();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setBusyId(null);
    }
  };

  const generateAll = async () => {
    let ok = 0, fail = 0;
    for (const s of students) {
      try { await computeRecommendationsForStudent(s.user_id); ok++; } catch { fail++; }
    }
    toast.success(`Generated ${ok} recommendations${fail ? `, ${fail} skipped` : ""}`);
    fetchStudents();
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Generate Recommendations</h1>
        <Button onClick={generateAll} disabled={loading || !students.length}>
          <Sparkles className="h-4 w-4 mr-2" /> Generate for All
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Top Recommendation</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : students.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
              ) : students.map(s => (
                <TableRow key={s.user_id}>
                  <TableCell className="font-medium">{s.full_name || "—"}</TableCell>
                  <TableCell>{s.school || "—"}</TableCell>
                  <TableCell>
                    {s.top ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.top.pathways?.color }} />
                        {s.top.pathways?.name}
                      </div>
                    ) : <Badge variant="outline">Not generated</Badge>}
                  </TableCell>
                  <TableCell>{s.top ? `${s.top.final_score}%` : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => generateOne(s.user_id)} disabled={busyId === s.user_id}>
                      {busyId === s.user_id ? "Generating..." : s.top ? "Recompute" : "Generate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default GenerateRecommendations;
