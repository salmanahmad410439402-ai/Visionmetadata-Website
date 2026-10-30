import { Suspense, lazy, useEffect } from "react";
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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSenseLoader from "@/components/ads/AdSenseLoader";
import { JsonLd, organisationSchema } from "@/lib/structuredData";
import ToolsDiscoveryModal from "@/components/ToolsDiscoveryModal";

// Route-level code splitting so visitors only download the page they open
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const DownloadPage = lazy(() => import("./pages/Download"));
const ContactPage = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const ChromeExtension = lazy(() => import("./pages/ChromeExtension"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const EditorialPolicy = lazy(() => import("./pages/EditorialPolicy"));
const ToolPage = lazy(() => import("./pages/Tool"));
const PlatformLimits = lazy(() => import("./pages/PlatformLimits"));
const MetadataChecker = lazy(() => import("./pages/MetadataChecker"));
const StockCsvConverter = lazy(() => import("./pages/StockCsvConverter"));
const EventCalendar = lazy(() => import("./pages/EventCalendar"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteLoadingFallback = () => (
  <div className="min-h-[65vh] flex items-center justify-center px-6 pt-28 pb-16">
    <div className="glass-panel rounded-2xl px-6 py-4 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
      <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
      Loading workspace…
    </div>
  </div>
);

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
          <AdSenseLoader />
          <Navbar />
          <ToolsDiscoveryModal />
          <ConsentBanner />
          <main className="min-h-screen bg-background">
            <Suspense fallback={<RouteLoadingFallback />}>
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
                <Route path="/metadata-checker" element={<MetadataChecker />} />
                <Route path="/stock-csv-converter" element={<StockCsvConverter />} />
                <Route path="/event-calendar" element={<EventCalendar />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </BrowserRouter>
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
