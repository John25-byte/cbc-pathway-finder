import { supabase } from "@/integrations/supabase/client";

export async function computeRecommendationsForStudent(studentId: string) {
  const [resultsRes, weightsRes, responsesRes, questionsRes, pathwaysRes] = await Promise.all([
    supabase.from("results").select("subject_id, score").eq("student_id", studentId),
    supabase.from("pathway_weights").select("pathway_id, subject_id, weight_value"),
    supabase.from("interest_responses").select("question_id, answer_value").eq("student_id", studentId),
    supabase.from("interest_questions").select("id, pathway_weights"),
    supabase.from("pathways").select("id, name"),
  ]);

  if (!resultsRes.data?.length) throw new Error("No academic results found for this student.");
  if (!responsesRes.data?.length) throw new Error("Student has not completed the interest assessment.");

  const pathways = pathwaysRes.data || [];
  const results = resultsRes.data;
  const weights = weightsRes.data || [];
  const responses = responsesRes.data;
  const questions = questionsRes.data || [];

  const recs: any[] = [];
  for (const pathway of pathways) {
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

    let interestTotal = 0;
    let interestMax = 0;
    for (const resp of responses) {
      const q = questions.find((qu: any) => qu.id === resp.question_id);
      if (q && q.pathway_weights) {
        const w = (q.pathway_weights as any)[pathway.name] || 0;
        interestTotal += Number(resp.answer_value) * w;
        interestMax += 5 * w;
      }
    }
    const interestScore = interestMax > 0 ? (interestTotal / interestMax) * 100 : 0;
    const finalScore = academicScore * 0.7 + interestScore * 0.3;
    const confidence = Math.min(100, Math.round(finalScore * 1.1));

    recs.push({
      student_id: studentId,
      pathway_id: pathway.id,
      academic_score: Math.round(academicScore * 100) / 100,
      interest_score: Math.round(interestScore * 100) / 100,
      final_score: Math.round(finalScore * 100) / 100,
      confidence,
      explanation: `Academic: ${Math.round(academicScore)}% | Interest: ${Math.round(interestScore)}%`,
    });
  }

  const { error } = await supabase
    .from("recommendations")
    .upsert(recs, { onConflict: "student_id,pathway_id" });
  if (error) throw error;

  // Return top pathway
  const top = recs.reduce((a, b) => (a.final_score > b.final_score ? a : b));
  return top;
}
