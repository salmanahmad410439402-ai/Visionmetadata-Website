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
import PlatformLimits from "./pages/PlatformLimits";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSenseLoader from "@/components/ads/AdSenseLoader";
import { JsonLd, organisationSchema } from "@/lib/structuredData";
import ToolsDiscoveryModal from "@/components/ToolsDiscoveryModal";

// Code-split only the heavy interactive workspaces (piexifjs / jszip / AI dashboard)
// while keeping all editorial, reference, marketing, legal, and 404 routes eager
// so crawlers (Googlebot WRS, Mediapartners-Google) and readers never see a
// Suspense loading placeholder wipe out prerendered content.
const loadToolPage = () => import("./pages/Tool");
const loadMetadataChecker = () => import("./pages/MetadataChecker");
const loadStockCsvConverter = () => import("./pages/StockCsvConverter");
const loadEventCalendar = () => import("./pages/EventCalendar");

const ToolPage = lazy(loadToolPage);
const MetadataChecker = lazy(loadMetadataChecker);
const StockCsvConverter = lazy(loadStockCsvConverter);
const EventCalendar = lazy(loadEventCalendar);

/**
 * Preloads the matching lazy workspace chunk BEFORE React mounts onto `#root`
 * so the prerendered `.prerender-shell` stays visible until the interactive
 * route is ready to render synchronously.
 */
export function preloadInitialRoute(pathname: string): Promise<unknown> {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  switch (normalized) {
    case "/tool":
      return loadToolPage();
    case "/metadata-checker":
      return loadMetadataChecker();
    case "/stock-csv-converter":
      return loadStockCsvConverter();
    case "/event-calendar":
      return loadEventCalendar();
    default:
      return Promise.resolve();
  }
}

const RouteLoadingFallback = () => (
  <div className="min-h-[65vh] flex items-center justify-center px-6 pt-28 pb-16">
    <div className="glass-panel rounded-2xl px-6 py-4 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
      <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
      Opening interactive tool…
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
