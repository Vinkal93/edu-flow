import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Courses from "./pages/Courses";
import Batches from "./pages/Batches";
import Fees from "./pages/Fees";
import Attendance from "./pages/Attendance";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            
            {/* Student Portal */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            {/* Institute Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["institute_admin", "teacher"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/students" element={
              <ProtectedRoute allowedRoles={["institute_admin", "teacher"]}>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/teachers" element={
              <ProtectedRoute allowedRoles={["institute_admin"]}>
                <Teachers />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/courses" element={
              <ProtectedRoute allowedRoles={["institute_admin", "teacher"]}>
                <Courses />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/batches" element={
              <ProtectedRoute allowedRoles={["institute_admin", "teacher"]}>
                <Batches />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/fees" element={
              <ProtectedRoute allowedRoles={["institute_admin"]}>
                <Fees />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/attendance" element={
              <ProtectedRoute allowedRoles={["institute_admin", "teacher"]}>
                <Attendance />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
