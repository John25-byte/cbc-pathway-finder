import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Subject { id: string; name: string; }

const UploadResults = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [existingResults, setExistingResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [sRes, rRes] = await Promise.all([
        supabase.from("subjects").select("id, name").order("name"),
        supabase.from("user_roles").select("user_id").eq("role", "student"),
      ]);
      if (sRes.data) setSubjects(sRes.data);
      if (rRes.data) {
        const ids = rRes.data.map((r: any) => r.user_id);
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, school").in("user_id", ids);
        setStudents((profiles || []).map((p: any) => ({
          user_id: p.user_id,
          full_name: p.full_name || "Unknown",
          school: p.school || "",
        })));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const fetchExisting = async () => {
      const { data } = await supabase.from("results").select("subject_id, score").eq("student_id", selectedStudent);
      if (data) {
        setExistingResults(data);
        const s: Record<string, string> = {};
        data.forEach((r: any) => { s[r.subject_id] = r.score.toString(); });
        setScores(s);
      }
    };
    fetchExisting();
  }, [selectedStudent]);

  const handleSave = async () => {
    if (!user || !selectedStudent) return;
    setSaving(true);
    const rows = Object.entries(scores)
      .filter(([, v]) => v !== "" && !isNaN(Number(v)))
      .map(([subject_id, score]) => ({
        student_id: selectedStudent,
        subject_id,
        score: Number(score),
        examiner_id: user.id,
        verified: false,
      }));

    const { error } = await supabase.from("results").upsert(rows, { onConflict: "student_id,subject_id" });
    if (error) toast.error("Failed to save results");
    else toast.success("Results saved successfully!");
    setSaving(false);
  };

  if (loading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Upload Student Results</h1>

      <Card className="mb-6">
        <CardHeader><CardTitle>Select Student</CardTitle></CardHeader>
        <CardContent>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.user_id} value={s.user_id}>
                  {s.full_name} {s.school ? `(${s.school})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader><CardTitle>Enter Marks</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-32">Score (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0-100"
                        value={scores[sub.id] || ""}
                        onChange={(e) => setScores(prev => ({ ...prev, [sub.id]: e.target.value }))}
                        className="w-24"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Results"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default UploadResults;
