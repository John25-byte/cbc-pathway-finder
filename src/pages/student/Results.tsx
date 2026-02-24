import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ResultData {
  subject_name: string;
  score: number;
  verified: boolean;
}

const Results = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchResults = async () => {
      const { data } = await supabase
        .from("results")
        .select("score, verified, subjects(name)")
        .eq("student_id", user.id);
      
      if (data) {
        setResults(data.map((r: any) => ({
          subject_name: r.subjects?.name || "Unknown",
          score: Number(r.score),
          verified: r.verified,
        })));
      }
      setLoading(false);
    };
    fetchResults();
  }, [user]);

  const getBarColor = (score: number) => {
    if (score >= 75) return "hsl(142, 71%, 45%)";
    if (score >= 50) return "hsl(217, 91%, 60%)";
    return "hsl(25, 95%, 53%)";
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">My Academic Results</h1>
      
      {loading ? (
        <p className="text-muted-foreground">Loading results...</p>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No results uploaded yet. Your examiner will upload your marks.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="subject_name" angle={-45} textAnchor="end" className="text-xs" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {results.map((entry, index) => (
                        <Cell key={index} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((r) => (
              <Card key={r.subject_name}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{r.subject_name}</p>
                    <p className="text-xs text-muted-foreground">{r.verified ? "✅ Verified" : "⏳ Pending verification"}</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: getBarColor(r.score) }}>{r.score}%</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Results;
