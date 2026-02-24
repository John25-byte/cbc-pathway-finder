import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PathwayConfig = () => {
  const [pathways, setPathways] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [clusterReqs, setClusterReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [pRes, sRes, wRes, cRes] = await Promise.all([
        supabase.from("pathways").select("*"),
        supabase.from("subjects").select("*").order("name"),
        supabase.from("pathway_weights").select("*"),
        supabase.from("cluster_requirements").select("*"),
      ]);
      if (pRes.data) setPathways(pRes.data);
      if (sRes.data) setSubjects(sRes.data);
      if (wRes.data) setWeights(wRes.data);
      if (cRes.data) setClusterReqs(cRes.data);
      setLoading(false);
    };
    fetch();
  }, []);

  const getWeight = (pathwayId: string, subjectId: string) => {
    const w = weights.find((w: any) => w.pathway_id === pathwayId && w.subject_id === subjectId);
    return w ? Number(w.weight_value) : 1;
  };

  const updateWeight = (pathwayId: string, subjectId: string, value: number) => {
    setWeights(prev => {
      const existing = prev.findIndex(w => w.pathway_id === pathwayId && w.subject_id === subjectId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], weight_value: value };
        return updated;
      }
      return [...prev, { pathway_id: pathwayId, subject_id: subjectId, weight_value: value }];
    });
  };

  const saveWeights = async () => {
    setSaving(true);
    const rows = weights.map(w => ({
      pathway_id: w.pathway_id,
      subject_id: w.subject_id,
      weight_value: w.weight_value,
    }));
    const { error } = await supabase.from("pathway_weights").upsert(rows, { onConflict: "pathway_id,subject_id" });
    if (error) toast.error("Failed to save weights");
    else toast.success("Weights saved!");
    setSaving(false);
  };

  const updateMinScore = (pathwayId: string, val: number) => {
    setClusterReqs(prev => prev.map(c => c.pathway_id === pathwayId ? { ...c, min_score: val } : c));
  };

  const saveCluster = async () => {
    setSaving(true);
    for (const c of clusterReqs) {
      await supabase.from("cluster_requirements").update({ min_score: c.min_score }).eq("id", c.id);
    }
    toast.success("Cluster requirements saved!");
    setSaving(false);
  };

  if (loading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Pathway Configuration</h1>

      <Tabs defaultValue="weights">
        <TabsList>
          <TabsTrigger value="weights">Subject Weights</TabsTrigger>
          <TabsTrigger value="cluster">Cluster Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="weights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Weights per Pathway</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      {pathways.map(p => (
                        <TableHead key={p.id} style={{ color: p.color }}>{p.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        {pathways.map(p => (
                          <TableCell key={p.id}>
                            <Input
                              type="number"
                              min={0}
                              max={5}
                              step={0.5}
                              value={getWeight(p.id, s.id)}
                              onChange={(e) => updateWeight(p.id, s.id, Number(e.target.value))}
                              className="w-20"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={saveWeights} className="mt-6" disabled={saving}>
                {saving ? "Saving..." : "Save Weights"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cluster" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Minimum Scores per Pathway</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {pathways.map(p => {
                const cr = clusterReqs.find(c => c.pathway_id === p.id);
                return (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium w-48">{p.name}</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={cr?.min_score || 50}
                      onChange={(e) => updateMinScore(p.id, Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">% minimum</span>
                  </div>
                );
              })}
              <Button onClick={saveCluster} disabled={saving}>
                {saving ? "Saving..." : "Save Requirements"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PathwayConfig;
