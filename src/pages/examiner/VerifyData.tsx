import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const VerifyData = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    const { data } = await supabase
      .from("results")
      .select("id, score, verified, student_id, subjects(name)")
      .order("created_at", { ascending: false });
    
    if (data) {
      // Fetch profiles for student names
      const studentIds = [...new Set(data.map((r: any) => r.student_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", studentIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      setResults(data.map((r: any) => ({ ...r, student_name: profileMap.get(r.student_id) || "Unknown" })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchResults(); }, []);

  const verifyResult = async (id: string) => {
    const { error } = await supabase.from("results").update({ verified: true }).eq("id", id);
    if (error) toast.error("Failed to verify");
    else { toast.success("Result verified!"); fetchResults(); }
  };

  const verifyAll = async () => {
    const unverified = results.filter(r => !r.verified).map(r => r.id);
    if (!unverified.length) return;
    const { error } = await supabase.from("results").update({ verified: true }).in("id", unverified);
    if (error) toast.error("Failed to verify all");
    else { toast.success("All results verified!"); fetchResults(); }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Verify Student Data</h1>
        <Button onClick={verifyAll} variant="outline"><CheckCircle className="h-4 w-4 mr-2" />Verify All</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : results.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No results to verify</TableCell></TableRow>
              ) : results.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.student_name || "Unknown"}</TableCell>
                  <TableCell>{(r.subjects as any)?.name}</TableCell>
                  <TableCell className="font-semibold">{Number(r.score)}%</TableCell>
                  <TableCell>
                    <Badge variant={r.verified ? "default" : "secondary"}>
                      {r.verified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!r.verified && (
                      <Button size="sm" variant="outline" onClick={() => verifyResult(r.id)}>
                        Verify
                      </Button>
                    )}
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

export default VerifyData;
