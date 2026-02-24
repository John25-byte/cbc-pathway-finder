import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Briefcase, GraduationCap, Target, TrendingUp } from "lucide-react";

const Guidance = () => {
  const { user } = useAuth();
  const [pathways, setPathways] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("pathways").select("*");
      if (data) setPathways(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = pathways.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const Wrapper = user ? DashboardLayout : ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center h-16 px-4">
          <span className="font-bold text-lg">🎓 CBC Pathway Guide</span>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );

  return (
    <Wrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Guidance Panel</h1>
        <p className="text-muted-foreground mb-6">Explore the three CBC Senior School pathways, their requirements, and career opportunities</p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pathways..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-8">
          {filtered.map(p => {
            const careers = Array.isArray(p.careers) ? p.careers : [];
            const focusAreas = Array.isArray(p.focus_areas) ? p.focus_areas : [];
            const strengths = Array.isArray(p.required_strengths) ? p.required_strengths : [];
            const progression = Array.isArray(p.progression) ? p.progression : [];

            return (
              <Card key={p.id} className="overflow-hidden">
                <div className="h-2" style={{ backgroundColor: p.color }} />
                <CardHeader>
                  <CardTitle className="text-2xl" style={{ color: p.color }}>{p.name}</CardTitle>
                  <CardDescription className="text-base">{p.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">Focus Areas</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {focusAreas.map((f: string) => (
                          <Badge key={f} variant="secondary">{f}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">Required Strengths</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {strengths.map((s: string) => (
                          <Badge key={s} variant="outline">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">Career Opportunities</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {careers.map((c: string) => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">Progression Paths</h3>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {progression.map((pr: string) => (
                          <li key={pr}>• {pr}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Wrapper>
  );
};

export default Guidance;
