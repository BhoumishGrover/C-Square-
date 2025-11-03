import { useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Explorer from "./pages/Explorer";
import Docs from "./pages/Docs";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import StillWorking from "./pages/stillworking";
import { fetchSession } from "./lib/api";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    let cancelled = false;

    const isDev = import.meta.env.DEV;

    const syncSession = async () => {
      try {
        const session = await fetchSession();
        if (!session?.company || cancelled) {
          return;
        }
        const { company } = session;
        if (company.companyId) {
          localStorage.setItem('csquare_company_id', company.companyId);
        }
        if (company.slug) {
          localStorage.setItem('csquare_company_slug', company.slug);
        }
        if (company.name) {
          localStorage.setItem('csquare_company_name', company.name);
        }
        if (company.authProvider) {
          localStorage.setItem('csquare_auth_provider', company.authProvider);
        }
        if (company.role) {
          localStorage.setItem('csquare_role', company.role);
        }
      } catch (err) {
        // 401 just means no active session; ignore silently
        if (isDev) {
          if (err instanceof Error && err.message.includes('Not authenticated')) {
            return;
          }
          // eslint-disable-next-line no-console
          console.debug('Session sync skipped', err);
        }
      }
    };

    syncSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/explorer" element={<Explorer />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/marketplace/stillworking" element={<StillWorking />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
