import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pathwaysData, searchPathways, type Pathway } from "@/data/pathways";
import { Search, Briefcase, GraduationCap, Target, TrendingUp, Lightbulb, Users, BookOpen, Award } from "lucide-react";

const Guidance = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);
  const [filtered, setFiltered] = useState<Pathway[]>(pathwaysData);

  useEffect(() => {
    if (search.trim()) {
      setFiltered(searchPathways(search));
    } else {
      setFiltered(pathwaysData);
    }
  }, [search]);

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

  if (selectedPathway) {
    return (
      <Wrapper>
        <Button
          variant="ghost"
          onClick={() => setSelectedPathway(null)}
          className="mb-6"
        >
          ← Back to All Pathways
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="h-2 rounded" style={{ backgroundColor: selectedPathway.color }} />
            <h1 className="text-4xl font-bold mt-4 mb-2" style={{ color: selectedPathway.color }}>
              {selectedPathway.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">{selectedPathway.description}</p>
            {selectedPathway.placementStats && (
              <Badge className="mb-4">{selectedPathway.placementStats}</Badge>
            )}
            <p className="text-base leading-relaxed">{selectedPathway.overview}</p>
          </div>

          <Tabs defaultValue="focus" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="focus">Focus</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="careers">Careers</TabsTrigger>
              <TabsTrigger value="progression">Progression</TabsTrigger>
              <TabsTrigger value="competencies">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="focus">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Focus Areas
                  </CardTitle>
                  <CardDescription>Specialization areas within this pathway</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPathway.focusAreas.map((area, idx) => (
                      <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                        <p className="font-medium">{area}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Required Strengths
                  </CardTitle>
                  <CardDescription>Key attributes that help in this pathway</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedPathway.requiredStrengths.map((strength, idx) => (
                      <Badge key={idx} variant="outline" className="text-base py-2 px-3 justify-center">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Available Subjects
                  </CardTitle>
                  <CardDescription>Courses you can study in this pathway</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedPathway.subjects.map((subject, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPathway.color }} />
                        <span>{subject}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="careers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Career Opportunities ({selectedPathway.careers.length}+)
                  </CardTitle>
                  <CardDescription>Professional paths available after this pathway</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedPathway.careers.map((career, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm py-2 px-3 justify-center">
                        {career}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progression">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progression Paths
                  </CardTitle>
                  <CardDescription>Next steps after Senior School</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Further Education Options</h3>
                      <ul className="space-y-2">
                        {selectedPathway.progressionPaths.map((path, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-2 bg-secondary/50 rounded">
                            <span className="text-primary font-bold">•</span>
                            <span>{path}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Leading Universities</h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {selectedPathway.universityOptions.map((uni, idx) => (
                          <Badge key={idx} variant="outline">
                            {uni}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competencies">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Key Competencies
                  </CardTitle>
                  <CardDescription>Essential skills developed in this pathway</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedPathway.keyCompetencies.map((comp, idx) => (
                      <div key={idx} className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                        <p className="font-medium text-sm">{comp}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore CBC Senior School Pathways</h1>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Kenya's Competency-Based Curriculum offers three specialized pathways in Senior School (Grades 10-12).
          Choose the pathway that aligns with your strengths, interests, and career aspirations. Click on any pathway
          to explore detailed information about subjects, careers, and progression options.
        </p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pathways, careers, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center p-8">
          <p className="text-muted-foreground">No pathways found matching "{search}". Try different keywords.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {filtered.map(pathway => (
            <Card
              key={pathway.id}
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedPathway(pathway)}
            >
              <div className="h-3" style={{ backgroundColor: pathway.color }} />
              <CardHeader>
                <CardTitle className="group-hover:translate-x-1 transition-transform" style={{ color: pathway.color }}>
                  {pathway.name}
                </CardTitle>
                <CardDescription>{pathway.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Focus Areas
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {pathway.focusAreas.slice(0, 2).map(area => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area.split('(')[0].trim().slice(0, 20)}...
                      </Badge>
                    ))}
                    {pathway.focusAreas.length > 2 && (
                      <Badge variant="outline" className="text-xs">+{pathway.focusAreas.length - 2}</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Career Opportunities
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {pathway.careers.length}+ careers including {pathway.careers.slice(0, 2).join(", ")}...
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Required Strengths
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {pathway.requiredStrengths.slice(0, 2).map(strength => (
                      <Badge key={strength} variant="outline" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full mt-4" style={{ backgroundColor: pathway.color }}>
                  Explore Pathway →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              How to Choose Your Pathway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">1. Assess Your Strengths</h4>
                <p className="text-sm text-muted-foreground">
                  Reflect on subjects where you excel and skills that come naturally to you. Your Grade 9 results will guide pathway eligibility.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Explore Your Interests</h4>
                <p className="text-sm text-muted-foreground">
                  Consider careers that excite you. Use this tool to discover which pathway leads to your dream job.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Consult with Counselors</h4>
                <p className="text-sm text-muted-foreground">
                  Talk to career counselors, teachers, and parents. They can help you make an informed decision aligned with your future goals.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Plan Your Future</h4>
                <p className="text-sm text-muted-foreground">
                  Know the universities and TVET institutions offering programs in your chosen pathway. Start building relevant skills now.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Wrapper>
  );
};

export default Guidance;
