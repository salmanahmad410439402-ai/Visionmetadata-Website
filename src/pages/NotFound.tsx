import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, BookOpen, ClipboardCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 pt-24 pb-20">
      <Helmet>
        <title>404 — Page Not Found | Tagyfy Pro</title>
        <meta
          name="description"
          content="The page you requested does not exist or has moved."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-xl w-full glass-panel rounded-3xl p-8 sm:p-12 border border-border/80 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 text-primary font-black text-xl">
          404
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">
          Page not found
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          We could not find a page at <code className="font-mono text-xs text-primary">{location.pathname}</code>.
          It may have been moved, renamed, or typed incorrectly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button className="rounded-xl font-bold gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link to="/blogs">
            <Button variant="outline" className="rounded-xl font-semibold gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Contributor Guides
            </Button>
          </Link>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/tool" className="inline-flex items-center gap-1 hover:text-primary underline">
            <Sparkles className="w-3.5 h-3.5" />
            Free Online Tool
          </Link>
          <Link to="/metadata-checker" className="inline-flex items-center gap-1 hover:text-primary underline">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Metadata Checker
          </Link>
          <Link to="/metadata-limits" className="hover:text-primary underline">
            Marketplace Limits
          </Link>
          <Link to="/faq" className="hover:text-primary underline">
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
