import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import BuyPage from "./pages/BuyPage";
import BuyFormPage from "./pages/BuyFormPage";
import SellPage from "./pages/SellPage";
import SellFormPage from "./pages/SellFormPage";
import LendingPage from "./pages/LendingPage";
import LendingFormPage from "./pages/LendingFormPage";
import AssetsPage from "./pages/AssetsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/buy" element={<ProtectedRoute><BuyPage /></ProtectedRoute>} />
            <Route path="/buy/:coinId" element={<ProtectedRoute><BuyFormPage /></ProtectedRoute>} />
            <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
            <Route path="/sell/:coinId" element={<ProtectedRoute><SellFormPage /></ProtectedRoute>} />
            <Route path="/lending" element={<ProtectedRoute><LendingPage /></ProtectedRoute>} />
            <Route path="/lending/:coinId" element={<ProtectedRoute><LendingFormPage /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
