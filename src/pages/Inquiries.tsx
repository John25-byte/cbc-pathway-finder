import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquarePlus, Send } from "lucide-react";

type Role = "student" | "examiner" | "admin";

const Inquiries = () => {
  const { user, role } = useAuth();
  const isStudent = role === "student";
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New inquiry (student only)
  const [newOpen, setNewOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newRecipient, setNewRecipient] = useState<Role>("admin");
  const [newMessage, setNewMessage] = useState("");

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const loadInquiries = async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase.from("inquiries").select("*").order("updated_at", { ascending: false });
    if (isStudent) query = query.eq("student_id", user.id);
    else if (role) query = query.eq("recipient_role", role as any);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    const list = data || [];
    setInquiries(list);
    // Load student names for staff view
    if (!isStudent && list.length) {
      const ids = Array.from(new Set(list.map((i: any) => i.student_id)));
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => { map[p.user_id] = p.full_name; });
      setProfileMap(map);
    }
    if (!selectedId && list.length) setSelectedId(list[0].id);
    setLoading(false);
  };

  const loadMessages = async (id: string) => {
    const { data, error } = await supabase
      .from("inquiry_messages")
      .select("*")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setMessages(data || []);
  };

  useEffect(() => { loadInquiries(); }, [user, role]);
  useEffect(() => { if (selectedId) loadMessages(selectedId); }, [selectedId]);

  const selected = useMemo(() => inquiries.find(i => i.id === selectedId), [inquiries, selectedId]);

  const handleCreate = async () => {
    if (!user || !newSubject.trim() || !newMessage.trim()) return;
    setSending(true);
    const { data, error } = await supabase.from("inquiries").insert({
      student_id: user.id,
      recipient_role: newRecipient as any,
      subject: newSubject.trim(),
    }).select().single();
    if (error || !data) {
      toast.error(error?.message || "Failed to create inquiry");
      setSending(false);
      return;
    }
    const { error: mErr } = await supabase.from("inquiry_messages").insert({
      inquiry_id: data.id,
      sender_id: user.id,
      message: newMessage.trim(),
    });
    if (mErr) toast.error(mErr.message);
    else {
      toast.success("Inquiry sent");
      setNewOpen(false);
      setNewSubject(""); setNewMessage("");
      setSelectedId(data.id);
      await loadInquiries();
    }
    setSending(false);
  };

  const handleReply = async () => {
    if (!user || !selectedId || !reply.trim()) return;
    setSending(true);
    const { error } = await supabase.from("inquiry_messages").insert({
      inquiry_id: selectedId,
      sender_id: user.id,
      message: reply.trim(),
    });
    if (error) toast.error(error.message);
    else {
      // If staff replied, mark answered; touch updated_at
      const newStatus = !isStudent ? "answered" : selected?.status || "open";
      await supabase.from("inquiries").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", selectedId);
      setReply("");
      await loadMessages(selectedId);
      await loadInquiries();
    }
    setSending(false);
  };

  const closeInquiry = async () => {
    if (!selectedId) return;
    await supabase.from("inquiries").update({ status: "closed" }).eq("id", selectedId);
    await loadInquiries();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inquiries & Messages</h1>
          <p className="text-muted-foreground text-sm">
            {isStudent ? "Send questions to your teacher or administrator." : `Respond to student inquiries directed to ${role}s.`}
          </p>
        </div>
        {isStudent && (
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button><MessageSquarePlus className="h-4 w-4 mr-2" />New Inquiry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send an inquiry</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Send to</label>
                  <Select value={newRecipient} onValueChange={(v) => setNewRecipient(v as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="examiner">Teacher (Examiner)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} maxLength={140} placeholder="e.g. Question about my pathway adjustment" />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} maxLength={2000} rows={5} />
                </div>
                <Button onClick={handleCreate} disabled={sending || !newSubject.trim() || !newMessage.trim()} className="w-full">
                  {sending ? "Sending..." : "Send Inquiry"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Conversations</CardTitle></CardHeader>
          <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading...</p>
            ) : inquiries.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No inquiries yet.</p>
            ) : (
              inquiries.map(i => (
                <button
                  key={i.id}
                  onClick={() => setSelectedId(i.id)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-muted/40 transition ${selectedId === i.id ? "bg-muted/60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm truncate">{i.subject}</div>
                    <Badge variant={i.status === "closed" ? "secondary" : i.status === "answered" ? "default" : "outline"}>
                      {i.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {isStudent ? `To: ${i.recipient_role}` : `From: ${profileMap[i.student_id] || "Student"}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(i.updated_at).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {!selected ? (
            <CardContent className="p-8 text-center text-muted-foreground">Select a conversation to view messages.</CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{selected.subject}</CardTitle>
                    <CardDescription>
                      {isStudent ? `Sent to ${selected.recipient_role}` : `From ${profileMap[selected.student_id] || "Student"}`} · <Badge className="ml-1" variant="outline">{selected.status}</Badge>
                    </CardDescription>
                  </div>
                  {selected.status !== "closed" && (
                    <Button variant="ghost" size="sm" onClick={closeInquiry}>Close</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto mb-4">
                  {messages.map(m => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <p className="whitespace-pre-wrap">{m.message}</p>
                          <p className={`text-[10px] mt-1 ${mine ? "opacity-80" : "text-muted-foreground"}`}>
                            {new Date(m.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selected.status !== "closed" && (
                  <div className="flex gap-2">
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      maxLength={2000}
                      rows={2}
                      placeholder={isStudent ? "Write a follow-up..." : "Write a response to the student..."}
                    />
                    <Button onClick={handleReply} disabled={sending || !reply.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Inquiries;
