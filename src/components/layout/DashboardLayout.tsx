import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, BookOpen, ClipboardList, Users, Settings, LogOut,
  GraduationCap, Upload, BarChart3, CheckCircle, FileText, Compass, Menu, X
} from "lucide-react";
import { useState } from "react";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = role === "student" ? [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/results", icon: BarChart3, label: "My Results" },
    { to: "/dashboard/assessment", icon: ClipboardList, label: "Interest Assessment" },
    { to: "/dashboard/recommendation", icon: GraduationCap, label: "My Recommendation" },
    { to: "/dashboard/application", icon: FileText, label: "Apply for Pathway" },
    { to: "/guidance", icon: Compass, label: "Guidance Panel" },
  ] : role === "examiner" ? [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/upload-results", icon: Upload, label: "Upload Results" },
    { to: "/dashboard/student-analytics", icon: BarChart3, label: "Student Analytics" },
    { to: "/dashboard/verify", icon: CheckCircle, label: "Verify Data" },
    { to: "/guidance", icon: Compass, label: "Guidance Panel" },
  ] : [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/users", icon: Users, label: "User Management" },
    { to: "/dashboard/pathway-config", icon: Settings, label: "Pathway Config" },
    { to: "/dashboard/applications", icon: FileText, label: "Applications" },
    { to: "/dashboard/reports", icon: BarChart3, label: "Reports" },
    { to: "/guidance", icon: Compass, label: "Guidance Panel" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h2 className="text-lg font-bold text-sidebar-primary-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>CBC Pathways</span>
        </h2>
        <p className="text-xs text-sidebar-foreground/60 mt-1 capitalize">{role} Portal</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-sm text-sidebar-foreground/80 mb-3 px-2">{profile?.full_name || "User"}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col transition-transform duration-200 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen lg:ml-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
