import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomTabs } from "@/components/BottomTabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import Merchants from "./pages/Merchants";
import Udhaar from "./pages/Udhaar";
import History from "./pages/History";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const TAB_PATHS = new Set(["/", "/income", "/expense", "/merchants", "/udhaar", "/history", "/reports"]);

function AuthGuard({ children }: { children: React.ReactNode }) {
  // Login hidden temporarily as requested
  return <>{children}</>;
}

function ChromeRoutes() {
  const location = useLocation();
  const showTabs = TAB_PATHS.has(location.pathname);

  return (
    <>
      {showTabs && <ThemeToggle />}
      <div className={showTabs ? "pb-20" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/income" element={<AuthGuard><Income /></AuthGuard>} />
          <Route path="/expense" element={<AuthGuard><Expense /></AuthGuard>} />
          <Route path="/merchants" element={<AuthGuard><Merchants /></AuthGuard>} />
          <Route path="/udhaar" element={<AuthGuard><Udhaar /></AuthGuard>} />
          <Route path="/history" element={<AuthGuard><History /></AuthGuard>} />
          <Route path="/reports" element={<AuthGuard><Reports /></AuthGuard>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {showTabs && <BottomTabs />}
    </>
  );
}

const App = () => {
  useEffect(() => {
    document.title = "Cashbook Tracker";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ChromeRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
