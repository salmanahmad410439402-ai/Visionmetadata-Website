import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { initializeAnalytics } from "@/lib/analytics";
import { applyStoredConsent } from "@/lib/consent";
import ConsentBanner from "@/components/ConsentBanner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import DownloadPage from "./pages/Download";
import ContactPage from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Tutorials from "./pages/Tutorials";
import ChromeExtension from "./pages/ChromeExtension";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import EditorialPolicy from "./pages/EditorialPolicy";
import ToolPage from "./pages/Tool";
import PlatformLimits from "./pages/PlatformLimits";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import { JsonLd, organisationSchema } from "@/lib/structuredData";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Re-apply a previous opt-in, then start tracking. The Consent Mode
    // defaults in index.html stay in force for anyone who has not opted in.
    applyStoredConsent();
    initializeAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <JsonLd data={organisationSchema()} />
          <Navbar />
          <ConsentBanner />
          <main className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/blogs" element={<Blogs />} />
              {/* /blog redirects to the canonical /blogs listing to avoid serving duplicate content at two URLs */}
              <Route path="/blog" element={<Navigate to="/blogs" replace />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/chrome-extension" element={<ChromeExtension />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/editorial-policy" element={<EditorialPolicy />} />
              <Route path="/tool" element={<ToolPage />} />
              <Route path="/metadata-limits" element={<PlatformLimits />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
