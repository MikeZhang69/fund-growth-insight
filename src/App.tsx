import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Use basename only in production (GitHub Pages)
const basename = import.meta.env.PROD ? "/fund-growth-insight" : "/";

// Component to handle GitHub Pages 404.html redirect pattern
const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have the query parameter pattern from 404.html redirect
    const queryString = location.search;
    if (queryString.startsWith("?/")) {
      // Extract the path from the query string
      // Format: ?/path/to/route&other=params
      const pathMatch = queryString.match(/\?\/?(.+?)(?:&|$)/);
      if (pathMatch) {
        const path = pathMatch[1].replace(/~and~/g, "&");
        // Replace the current location with the proper path
        navigate(path, { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RedirectHandler />
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
