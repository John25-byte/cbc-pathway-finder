import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

interface RecommendationData {
  pathway_name: string;
  academic_score: number;
  interest_score: number;
  final_score: number;
  confidence: number;
  explanation: string;
  color: string;
}

const Recommendation = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  const fetchRecommendations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("recommendations")
      .select("academic_score, interest_score, final_score, confidence, explanation, pathways(name, color)")
      .eq("student_id", user.id);

    if (data) {
      setRecommendations(data.map((r: any) => ({
        pathway_name: r.pathways?.name || "",
        academic_score: Number(r.academic_score),
        interest_score: Number(r.interest_score),
        final_score: Number(r.final_score),
        confidence: Number(r.confidence),
        explanation: r.explanation || "",
        color: r.pathways?.color || "#3b82f6",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecommendations(); }, [user]);

  const computeRecommendation = async () => {
    if (!user) return;
    setComputing(true);

    // Fetch results, pathway weights, interest responses, questions, pathways
    const [resultsRes, weightsRes, responsesRes, questionsRes, pathwaysRes] = await Promise.all([
      supabase.from("results").select("subject_id, score").eq("student_id", user.id),
      supabase.from("pathway_weights").select("pathway_id, subject_id, weight_value"),
      supabase.from("interest_responses").select("question_id, answer_value").eq("student_id", user.id),
      supabase.from("interest_questions").select("id, pathway_weights"),
      supabase.from("pathways").select("id, name"),
    ]);

    if (!resultsRes.data?.length) {
      toast.error("No academic results found. Please wait for your examiner to upload results.");
      setComputing(false);
      return;
    }
    if (!responsesRes.data?.length) {
      toast.error("Please complete the interest assessment first.");
      setComputing(false);
      return;
    }

    const pathways = pathwaysRes.data || [];
    const results = resultsRes.data;
    const weights = weightsRes.data || [];
    const responses = responsesRes.data;
    const questions = questionsRes.data || [];

    const recs: any[] = [];

    for (const pathway of pathways) {
      // Academic score: weighted average
      const pw = weights.filter((w: any) => w.pathway_id === pathway.id);
      let totalWeightedScore = 0;
      let totalWeight = 0;
      for (const w of pw) {
        const result = results.find((r: any) => r.subject_id === w.subject_id);
        if (result) {
          totalWeightedScore += Number(result.score) * Number(w.weight_value);
          totalWeight += Number(w.weight_value);
        }
      }
      const academicScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      // Interest score
      let interestTotal = 0;
      let interestMax = 0;
      for (const resp of responses) {
        const q = questions.find((qu: any) => qu.id === resp.question_id);
        if (q && q.pathway_weights) {
          const pw = (q.pathway_weights as any)[pathway.name] || 0;
          interestTotal += Number(resp.answer_value) * pw;
          interestMax += 5 * pw;
        }
      }
      const interestScore = interestMax > 0 ? (interestTotal / interestMax) * 100 : 0;

      const finalScore = academicScore * 0.7 + interestScore * 0.3;
      const confidence = Math.min(100, Math.round(finalScore * 1.1));

      recs.push({
        student_id: user.id,
        pathway_id: pathway.id,
        academic_score: Math.round(academicScore * 100) / 100,
        interest_score: Math.round(interestScore * 100) / 100,
        final_score: Math.round(finalScore * 100) / 100,
        confidence,
        explanation: `Academic: ${Math.round(academicScore)}% | Interest: ${Math.round(interestScore)}%`,
      });
    }

    // Upsert recommendations (use service role in production; here relies on RLS)
    // Students can't insert recommendations per RLS. We'll use a workaround:
    // Delete old and insert new via admin or edge function
    // For now, let's try upsert
    const { error } = await supabase.from("recommendations").upsert(recs, { onConflict: "student_id,pathway_id" });
    
    if (error) {
      toast.error("Could not compute recommendation. Please contact your administrator.");
    } else {
      toast.success("Recommendation computed!");
      fetchRecommendations();
    }
    setComputing(false);
  };

  const topRec = recommendations.length ? recommendations.reduce((a, b) => a.final_score > b.final_score ? a : b) : null;

  const radarData = recommendations.map(r => ({
    pathway: r.pathway_name,
    Academic: r.academic_score,
    Interest: r.interest_score,
    Overall: r.final_score,
  }));

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">My Pathway Recommendation</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : recommendations.length === 0 ? (
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-6">
              No recommendation yet. Make sure your results are uploaded and you've completed the interest assessment.
            </p>
            <Button onClick={computeRecommendation} disabled={computing}>
              {computing ? "Computing..." : "Generate My Recommendation"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {topRec && (
            <Card className="mb-6 border-2" style={{ borderColor: topRec.color }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  Recommended: {topRec.pathway_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-3xl font-bold" style={{ color: topRec.color }}>{topRec.confidence}%</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Academic Score</p>
                    <p className="text-3xl font-bold">{topRec.academic_score}%</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Interest Score</p>
                    <p className="text-3xl font-bold">{topRec.interest_score}%</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{topRec.explanation}</p>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader><CardTitle>Pathway Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="pathway" className="text-sm" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Academic" dataKey="Academic" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.2} />
                    <Radar name="Interest" dataKey="Interest" stroke="hsl(25, 95%, 53%)" fill="hsl(25, 95%, 53%)" fillOpacity={0.2} />
                    <Radar name="Overall" dataKey="Overall" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-4">
            {recommendations.sort((a, b) => b.final_score - a.final_score).map(r => (
              <Card key={r.pathway_name}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="font-semibold">{r.pathway_name}</span>
                  </div>
                  <p className="text-2xl font-bold mb-1">{r.final_score}%</p>
                  <p className="text-xs text-muted-foreground">Academic {r.academic_score}% • Interest {r.interest_score}%</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={computeRecommendation} disabled={computing}>
              {computing ? "Recomputing..." : "Recompute Recommendation"}
            </Button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Recommendation;
