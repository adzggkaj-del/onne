import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCoins from "./pages/admin/AdminCoins";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminBuyOrders from "./pages/admin/AdminBuyOrders";
import AdminSellOrders from "./pages/admin/AdminSellOrders";
import AdminLendingOrders from "./pages/admin/AdminLendingOrders";

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
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/coins" element={<AdminCoins />} />
            <Route path="/admin/orders/buy" element={<AdminBuyOrders />} />
            <Route path="/admin/orders/sell" element={<AdminSellOrders />} />
            <Route path="/admin/orders/lending" element={<AdminLendingOrders />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
