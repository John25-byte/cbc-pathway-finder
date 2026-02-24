import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FileText, GraduationCap, Upload, CheckCircle, ClipboardList, Compass } from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, color, to }: { title: string; value: string; icon: any; color: string; to: string }) => (
  <Link to={to}>
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const Dashboard = () => {
  const { role, profile } = useAuth();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || "User"} 👋</h1>
        <p className="text-muted-foreground mt-1 capitalize">{role} Dashboard</p>
      </div>

      {role === "student" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="My Results" value="View Scores" icon={BarChart3} color="bg-pathway-stem" to="/dashboard/results" />
          <StatCard title="Interest Assessment" value="Take Quiz" icon={ClipboardList} color="bg-pathway-arts" to="/dashboard/assessment" />
          <StatCard title="My Recommendation" value="View Match" icon={GraduationCap} color="bg-pathway-social" to="/dashboard/recommendation" />
          <StatCard title="Apply for Pathway" value="Submit" icon={FileText} color="bg-primary" to="/dashboard/application" />
          <StatCard title="Guidance Panel" value="Explore" icon={Compass} color="bg-muted-foreground" to="/guidance" />
        </div>
      )}

      {role === "examiner" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Upload Results" value="Enter Marks" icon={Upload} color="bg-pathway-stem" to="/dashboard/upload-results" />
          <StatCard title="Student Analytics" value="View Charts" icon={BarChart3} color="bg-pathway-arts" to="/dashboard/student-analytics" />
          <StatCard title="Verify Data" value="Confirm" icon={CheckCircle} color="bg-pathway-social" to="/dashboard/verify" />
        </div>
      )}

      {role === "admin" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="User Management" value="Manage" icon={Users} color="bg-pathway-stem" to="/dashboard/users" />
          <StatCard title="Pathway Config" value="Configure" icon={GraduationCap} color="bg-pathway-arts" to="/dashboard/pathway-config" />
          <StatCard title="Applications" value="Review" icon={FileText} color="bg-pathway-social" to="/dashboard/applications" />
          <StatCard title="Reports" value="Analytics" icon={BarChart3} color="bg-primary" to="/dashboard/reports" />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
