import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: string;
  question_text: string;
  sort_order: number;
}

const InterestAssessment = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [qRes, rRes] = await Promise.all([
        supabase.from("interest_questions").select("*").order("sort_order"),
        supabase.from("interest_responses").select("question_id, answer_value").eq("student_id", user.id),
      ]);

      if (qRes.data) setQuestions(qRes.data);
      if (rRes.data && rRes.data.length > 0) {
        const existing: Record<string, number> = {};
        rRes.data.forEach((r: any) => { existing[r.question_id] = r.answer_value; });
        setAnswers(existing);
        if (rRes.data.length === qRes.data?.length) setCompleted(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: parseInt(value) }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const rows = Object.entries(answers).map(([question_id, answer_value]) => ({
      student_id: user.id,
      question_id,
      answer_value,
    }));

    const { error } = await supabase.from("interest_responses").upsert(rows, { onConflict: "student_id,question_id" });
    
    if (error) {
      toast.error("Failed to save responses");
    } else {
      toast.success("Assessment completed! View your recommendation.");
      setCompleted(true);
    }
    setSubmitting(false);
  };

  const progress = questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0;
  const question = questions[currentIndex];

  const options = [
    { value: "1", label: "Strongly Disagree" },
    { value: "2", label: "Disagree" },
    { value: "3", label: "Neutral" },
    { value: "4", label: "Agree" },
    { value: "5", label: "Strongly Agree" },
  ];

  if (loading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  if (completed) {
    return (
      <DashboardLayout>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
            <p className="text-muted-foreground mb-6">Your interest profile has been recorded. Check your recommendation to see your pathway match.</p>
            <Button onClick={() => setCompleted(false)}>Retake Assessment</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Interest Assessment</h1>
      <p className="text-muted-foreground mb-6">Rate how much you agree with each statement (1-5)</p>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {question && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardDescription>Question {currentIndex + 1}</CardDescription>
            <CardTitle className="text-xl">{question.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[question.id]?.toString() || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {options.map(opt => (
                <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={opt.value} id={`q-${opt.value}`} />
                  <Label htmlFor={`q-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>
                Previous
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentIndex(i => i + 1)} disabled={!answers[question.id]}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length || submitting}>
                  {submitting ? "Submitting..." : "Submit Assessment"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default InterestAssessment;
