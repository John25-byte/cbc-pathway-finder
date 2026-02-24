import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Pathway { id: string; name: string; color: string; }

const Application = () => {
  const { user } = useAuth();
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [selectedPathway, setSelectedPathway] = useState("");
  const [application, setApplication] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [pRes, aRes, rRes] = await Promise.all([
        supabase.from("pathways").select("id, name, color"),
        supabase.from("applications").select("*, pathways!applications_chosen_pathway_id_fkey(name, color)").eq("student_id", user.id).maybeSingle(),
        supabase.from("recommendations").select("pathway_id, final_score, pathways(name)").eq("student_id", user.id).order("final_score", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (pRes.data) setPathways(pRes.data);
      if (aRes.data) setApplication(aRes.data);
      if (rRes.data) setRecommendation(rRes.data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !selectedPathway) return;
    setSubmitting(true);
    const { error } = await supabase.from("applications").insert({
      student_id: user.id,
      chosen_pathway_id: selectedPathway,
      recommended_pathway_id: recommendation?.pathway_id || null,
    });
    if (error) {
      if (error.code === "23505") toast.error("You have already submitted an application.");
      else toast.error("Failed to submit application");
    } else {
      toast.success("Application submitted successfully!");
      // Refetch
      const { data } = await supabase.from("applications").select("*, pathways!applications_chosen_pathway_id_fkey(name, color)").eq("student_id", user.id).maybeSingle();
      setApplication(data);
    }
    setSubmitting(false);
  };

  const statusColor = (s: string) => s === "approved" ? "bg-pathway-social text-primary-foreground" : s === "adjusted" ? "bg-pathway-arts text-primary-foreground" : "bg-muted text-muted-foreground";

  if (loading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Pathway Application</h1>

      {application ? (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Your pathway application details</CardDescription>
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
            {application.admin_notes && (
              <div>
                <span className="text-muted-foreground text-sm">Admin Notes:</span>
                <p className="mt-1 text-sm bg-muted p-3 rounded-lg">{application.admin_notes}</p>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Submitted: {new Date(application.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Apply for a Pathway</CardTitle>
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
                  {pathways.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={!selectedPathway || submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Application;
