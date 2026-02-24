import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Users, BarChart3, ArrowRight, Compass } from "lucide-react";

const pathways = [
  {
    name: "STEM",
    color: "bg-pathway-stem",
    textColor: "text-pathway-stem",
    description: "Science, Technology, Engineering & Mathematics",
    icon: "🔬",
  },
  {
    name: "Arts & Sports Science",
    color: "bg-pathway-arts",
    textColor: "text-pathway-arts",
    description: "Creative Arts, Performing Arts & Athletic Excellence",
    icon: "🎨",
  },
  {
    name: "Social Sciences",
    color: "bg-pathway-social",
    textColor: "text-pathway-social",
    description: "Governance, Economics, Education & Human Relations",
    icon: "🌍",
  },
];

const features = [
  { icon: BarChart3, title: "Academic Analysis", desc: "Performance-based pathway scoring using subject weights" },
  { icon: Compass, title: "Interest Assessment", desc: "Discover your strengths through guided questionnaires" },
  { icon: GraduationCap, title: "Smart Recommendation", desc: "AI-driven pathway matching with confidence scores" },
  { icon: Users, title: "Admin Management", desc: "Complete placement workflow with approval system" },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">CBC Pathway Guide</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <GraduationCap className="h-4 w-4" />
            CBC Senior School Pathway Guidance
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Find Your Perfect
            <span className="text-primary block">Senior School Pathway</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Helping Grade 9 learners under the Competency Based Curriculum make informed decisions about their future through academic analysis, interest assessment, and expert guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="text-base px-8">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/guidance">
              <Button size="lg" variant="outline" className="text-base px-8">
                Explore Pathways
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pathways Preview */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">Three Pathways, Endless Possibilities</h2>
        <p className="text-muted-foreground text-center mb-10">Choose the direction that matches your strengths and passions</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pathways.map((p) => (
            <Card key={p.name} className="group hover:shadow-lg transition-shadow overflow-hidden">
              <div className={`h-2 ${p.color}`} />
              <CardHeader>
                <div className="text-3xl mb-2">{p.icon}</div>
                <CardTitle className={`text-xl ${p.textColor}`}>{p.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{p.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 CBC Pathway Guidance System — Empowering Kenyan Learners</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
