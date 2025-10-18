import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MealSettingsProvider } from "@/contexts/MealSettingsContext";
import { ChatWidget } from "@/components/ChatWidget";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import GuestDashboard from "./pages/GuestDashboard";
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
import APISettings from "./pages/APISettings";
import UserDashboard from "./pages/UserDashboard";
import Reviews from "./pages/Reviews";
import Coupons from "./pages/Coupons";
import LoyaltyProgram from "./pages/LoyaltyProgram";
import HotelComparison from "./pages/HotelComparison";
import SpecialOffers from "./pages/SpecialOffers";
import LiveChatManagement from "./pages/LiveChatManagement";
import Install from "./pages/Install";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const RouterWithTheme = () => {
  const location = useLocation();
  const adminPaths = ['/admin', '/admin-dashboard', '/manage', '/employee', '/api-settings', '/site-settings', '/pdf-settings', '/audit-logs'];
  const isAdmin = adminPaths.some((p) => location.pathname.startsWith(p));
  return (
    <ThemeProvider isAdmin={isAdmin}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ChatWidget />
        <OfflineIndicator />
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/no-results" element={<NoResults />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/guest-dashboard" element={<GuestDashboard />} />
              <Route path="/dashboard/:phoneAndOrder" element={<GuestDashboard />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/loyalty-program" element={<LoyaltyProgram />} />
              <Route path="/hotel-comparison" element={<HotelComparison />} />
              <Route path="/special-offers" element={<SpecialOffers />} />
              <Route path="/install" element={<Install />} />
              <Route path="/live-chat" element={<ProtectedRoute><LiveChatManagement /></ProtectedRoute>} />
              <Route path="/live-chat-management" element={<ProtectedRoute><LiveChatManagement /></ProtectedRoute>} />
              <Route path="/manage-hotels" element={<ProtectedRoute><ManageHotels /></ProtectedRoute>} />
              <Route path="/seasonal-pricing" element={<ProtectedRoute><SeasonalPricing /></ProtectedRoute>} />
              <Route path="/employee-management" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />
              <Route path="/manage-employees" element={<ProtectedRoute><ManageEmployees /></ProtectedRoute>} />
              <Route path="/api-settings" element={<ProtectedRoute><APISettings /></ProtectedRoute>} />
              <Route path="/site-settings" element={<ProtectedRoute><SiteSettings /></ProtectedRoute>} />
              <Route path="/pdf-settings" element={<ProtectedRoute><PDFSettings /></ProtectedRoute>} />
              <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <MealSettingsProvider>
        <BrowserRouter>
          <RouterWithTheme />
        </BrowserRouter>
      </MealSettingsProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
