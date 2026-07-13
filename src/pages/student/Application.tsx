import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Pathway { id: string; name: string; color: string; }
interface ClusterReq { pathway_id: string; min_score: number; required_subjects: string[]; }
interface ResultRow { score: number; verified: boolean; subjects: { name: string } | null; }

const Application = () => {
  const { user } = useAuth();
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [clusters, setClusters] = useState<ClusterReq[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [selectedPathway, setSelectedPathway] = useState("");
  const [application, setApplication] = useState<any>(null);
  const [adminNote, setAdminNote] = useState<string>("");
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [pRes, cRes, rRes, aRes, recRes] = await Promise.all([
      supabase.from("pathways").select("id, name, color"),
      supabase.from("cluster_requirements").select("pathway_id, min_score, required_subjects"),
      supabase.from("results").select("score, verified, subjects(name)").eq("student_id", user.id),
      supabase.from("applications")
        .select("*, pathways!applications_chosen_pathway_id_fkey(name, color), application_admin_notes(notes)")
        .eq("student_id", user.id).maybeSingle(),
      supabase.from("recommendations")
        .select("pathway_id, final_score, pathways(name)")
        .eq("student_id", user.id).order("final_score", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (pRes.data) setPathways(pRes.data);
    if (cRes.data) setClusters(cRes.data as any);
    if (rRes.data) setResults(rRes.data as any);
    if (aRes.data) {
      setApplication(aRes.data);
      setAdminNote((aRes.data.application_admin_notes as any)?.[0]?.notes || "");
    } else {
      setApplication(null);
      setAdminNote("");
    }
    if (recRes.data) setRecommendation(recRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  // Check eligibility for a given pathway id
  const evaluateCluster = (pathwayId: string) => {
    const cluster = clusters.find(c => c.pathway_id === pathwayId);
    if (!cluster) return { eligible: true, reasons: [] as string[] };
    const reasons: string[] = [];
    const required = cluster.required_subjects || [];
    const missing: string[] = [];
    const below: string[] = [];
    for (const subj of required) {
      const match = results.find(r => r.verified && r.subjects?.name === subj);
      if (!match) missing.push(subj);
      else if (Number(match.score) < Number(cluster.min_score)) below.push(`${subj} (${match.score}%)`);
    }
    if (missing.length) reasons.push(`Missing verified results for: ${missing.join(", ")}`);
    if (below.length) reasons.push(`Below required minimum of ${cluster.min_score}%: ${below.join(", ")}`);
    return { eligible: reasons.length === 0, reasons, min_score: cluster.min_score, required };
  };

  const selectedEval = selectedPathway ? evaluateCluster(selectedPathway) : null;

  const handleSubmit = async () => {
    if (!user || !selectedPathway) return;
    const check = evaluateCluster(selectedPathway);
    if (!check.eligible) {
      toast.error("You do not meet the cluster requirements for this pathway.");
      return;
    }
    setSubmitting(true);
    // If a prior application exists (e.g., adjusted), delete it before re-applying
    if (application) {
      await supabase.from("applications").delete().eq("id", application.id);
    }
    const { error } = await supabase.from("applications").insert({
      student_id: user.id,
      chosen_pathway_id: selectedPathway,
      recommended_pathway_id: recommendation?.pathway_id || null,
    });
    if (error) {
      toast.error(error.message || "Failed to submit application");
    } else {
      toast.success("Application submitted successfully!");
      setSelectedPathway("");
      await load();
    }
    setSubmitting(false);
  };

  const statusColor = (s: string) => s === "approved"
    ? "bg-pathway-social text-primary-foreground"
    : s === "adjusted"
    ? "bg-pathway-arts text-primary-foreground"
    : "bg-muted text-muted-foreground";

  if (loading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  const canReapply = application && application.status === "adjusted";
  const showForm = !application || canReapply;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Pathway Application</h1>

      {application && (
        <Card className="max-w-xl mx-auto mb-6">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Your current pathway application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Chosen Pathway</span>
              <span className="font-semibold">{(application.pathways as any)?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge className={statusColor(application.status)}>{application.status.toUpperCase()}</Badge>
            </div>
            {application.status === "adjusted" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Your application was adjusted</AlertTitle>
                <AlertDescription>
                  <p className="mt-1">
                    <strong>Reason from administrator:</strong>{" "}
                    {adminNote || "No specific reason was provided. Please contact the school administrator."}
                  </p>
                  <p className="mt-2 text-sm">
                    You may re-apply below by choosing a different pathway that matches your cluster.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            {application.status === "approved" && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Approved</AlertTitle>
                <AlertDescription>
                  {adminNote || "Congratulations! Your pathway placement is confirmed."}
                </AlertDescription>
              </Alert>
            )}
            <div className="text-xs text-muted-foreground">
              Submitted: {new Date(application.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>{canReapply ? "Re-apply for a Pathway" : "Apply for a Pathway"}</CardTitle>
            <CardDescription>
              {recommendation
                ? `Your recommended pathway is ${(recommendation.pathways as any)?.name} (${Number(recommendation.final_score).toFixed(0)}% match)`
                : "Complete your assessment to see a recommendation"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Preferred Pathway</label>
              <Select value={selectedPathway} onValueChange={setSelectedPathway}>
                <SelectTrigger><SelectValue placeholder="Choose a pathway" /></SelectTrigger>
                <SelectContent>
                  {pathways.map(p => {
                    const ok = evaluateCluster(p.id).eligible;
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name} {ok ? "✓" : "✗"}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedEval && !selectedEval.eligible && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>You do not meet the cluster for this pathway</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    {selectedEval.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                  <p className="mt-2 text-sm">Choose a pathway you qualify for, or contact your teacher/admin.</p>
                </AlertDescription>
              </Alert>
            )}
            {selectedEval && selectedEval.eligible && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>You meet the cluster</AlertTitle>
                <AlertDescription>You are eligible to apply for this pathway.</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={!selectedPathway || submitting || (selectedEval ? !selectedEval.eligible : false)}
            >
              {submitting ? "Submitting..." : canReapply ? "Submit New Application" : "Submit Application"}
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Application;
