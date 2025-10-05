import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ManageEmployees from "./pages/ManageEmployees";
import Profile from "./pages/Profile";
import ManageHotels from "./pages/ManageHotels";
import SearchResults from "./pages/SearchResults";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import SiteSettings from "./pages/SiteSettings";
import NoResults from "./pages/NoResults";
import AuditLogs from "./pages/AuditLogs";
import PDFSettings from "./pages/PDFSettings";
import SeasonalPricing from "./pages/SeasonalPricing";
import EmployeeManagement from "./pages/EmployeeManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/no-results" element={<NoResults />} />
              <Route path="/hotel/:id" element={<HotelDetails />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/manage-employees" element={<ManageEmployees />} />
          <Route path="/profile" element={<Profile />} />
              <Route path="/manage-hotels" element={<ManageHotels />} />
              <Route path="/seasonal-pricing" element={<SeasonalPricing />} />
              <Route path="/employee-management" element={<EmployeeManagement />} />
              <Route path="/site-settings" element={<SiteSettings />} />
              <Route path="/pdf-settings" element={<PDFSettings />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
