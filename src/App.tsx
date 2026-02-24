import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/student/Results";
import InterestAssessment from "./pages/student/InterestAssessment";
import Recommendation from "./pages/student/Recommendation";
import Application from "./pages/student/Application";
import UploadResults from "./pages/examiner/UploadResults";
import StudentAnalytics from "./pages/examiner/StudentAnalytics";
import VerifyData from "./pages/examiner/VerifyData";
import UserManagement from "./pages/admin/UserManagement";
import PathwayConfig from "./pages/admin/PathwayConfig";
import ApplicationReview from "./pages/admin/ApplicationReview";
import Reports from "./pages/admin/Reports";
import Guidance from "./pages/Guidance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/guidance" element={<Guidance />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Student routes */}
            <Route path="/dashboard/results" element={<ProtectedRoute allowedRoles={["student"]}><Results /></ProtectedRoute>} />
            <Route path="/dashboard/assessment" element={<ProtectedRoute allowedRoles={["student"]}><InterestAssessment /></ProtectedRoute>} />
            <Route path="/dashboard/recommendation" element={<ProtectedRoute allowedRoles={["student"]}><Recommendation /></ProtectedRoute>} />
            <Route path="/dashboard/application" element={<ProtectedRoute allowedRoles={["student"]}><Application /></ProtectedRoute>} />

            {/* Examiner routes */}
            <Route path="/dashboard/upload-results" element={<ProtectedRoute allowedRoles={["examiner"]}><UploadResults /></ProtectedRoute>} />
            <Route path="/dashboard/student-analytics" element={<ProtectedRoute allowedRoles={["examiner"]}><StudentAnalytics /></ProtectedRoute>} />
            <Route path="/dashboard/verify" element={<ProtectedRoute allowedRoles={["examiner"]}><VerifyData /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/dashboard/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
            <Route path="/dashboard/pathway-config" element={<ProtectedRoute allowedRoles={["admin"]}><PathwayConfig /></ProtectedRoute>} />
            <Route path="/dashboard/applications" element={<ProtectedRoute allowedRoles={["admin"]}><ApplicationReview /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
