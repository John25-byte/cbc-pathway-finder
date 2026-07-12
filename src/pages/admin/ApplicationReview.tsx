import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ApplicationReview = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [pathways, setPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editApp, setEditApp] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  const fetchApps = async () => {
    const [aRes, pRes] = await Promise.all([
      supabase.from("applications").select(`
        *,
        chosen:pathways!applications_chosen_pathway_id_fkey(name, color),
        recommended:pathways!applications_recommended_pathway_id_fkey(name, color),
        application_admin_notes(notes)
      `).order("created_at", { ascending: false }),
      supabase.from("pathways").select("id, name, color"),
    ]);
    if (aRes.error) toast.error(`Failed to load applications: ${aRes.error.message}`);
    let apps = aRes.data || [];
    if (apps.length) {
      const studentIds = Array.from(new Set(apps.map((a: any) => a.student_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, school")
        .in("user_id", studentIds);
      const map = new Map((profs || []).map((p: any) => [p.user_id, p]));
      apps = apps.map((a: any) => ({ ...a, profiles: map.get(a.student_id) || null }));
    }
    setApplications(apps);
    if (pRes.data) setPathways(pRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, []);

  const handleUpdate = async () => {
    if (!editApp) return;
    const { error: statusError } = await supabase.from("applications").update({
      status: newStatus as any,
    }).eq("id", editApp.id);
    const { error: notesError } = await supabase
      .from("application_admin_notes")
      .upsert({ application_id: editApp.id, notes }, { onConflict: "application_id" });
    if (statusError || notesError) toast.error("Failed to update");
    else { toast.success("Application updated!"); setEditApp(null); fetchApps(); }
  };


  const statusColor = (s: string) => s === "approved" ? "bg-pathway-social text-primary-foreground" : s === "adjusted" ? "bg-pathway-arts text-primary-foreground" : "bg-muted text-muted-foreground";

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Application Review</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Chosen Pathway</TableHead>
                <TableHead>Recommended</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : applications.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applications yet</TableCell></TableRow>
              ) : applications.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{(a.profiles as any)?.full_name}</TableCell>
                  <TableCell>{(a.profiles as any)?.school || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (a.chosen as any)?.color }} />
                      {(a.chosen as any)?.name}
                    </div>
                  </TableCell>
                  <TableCell>{(a.recommended as any)?.name || "—"}</TableCell>
                  <TableCell><Badge className={statusColor(a.status)}>{a.status}</Badge></TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => { setEditApp(a); setNewStatus(a.status); setNotes((a.application_admin_notes as any)?.[0]?.notes || ""); }}>
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Review Application</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="adjusted">Adjusted</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Admin Notes</label>
                            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes about this decision..." />
                          </div>
                          <Button onClick={handleUpdate} className="w-full">Update Application</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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

export default ApplicationReview;
