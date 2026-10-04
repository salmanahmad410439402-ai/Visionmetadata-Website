import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from 'react-router-dom';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AssetsProvider } from '@/contexts/AssetsContext';
import { Dashboard } from '@/components/software-ui/dashboard/Dashboard';
import { Play, Sparkles, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const ToolPage: React.FC = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Show top notification toast when webapp is opened
    const timer = setTimeout(() => {
      toast("🎬 Watch Step-by-Step Tutorial", {
        description: "Learn how to generate metadata drafts and embed files in the Tagyfy workflow.",
        action: {
          label: "Watch Tutorial",
          onClick: () => navigate("/tutorials"),
        },
        duration: 9000,
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <SettingsProvider>
      <Helmet>
        <title>Free Online Metadata Generator Tool | Tagyfy Pro</title>
        <meta
          name="description"
          content="Generate draft titles, descriptions, and keywords for supported stock images and videos in your browser. Bring your own AI provider key and review every result before submission."
        />
      <link rel="canonical" href="https://tagyfy.com/tool" />
    </Helmet>
      <AssetsProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-16 sm:pt-20">
          
          {/* Top Tutorial Notification Banner */}
          {showBanner && (
            <div className="w-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm z-40 relative shadow-sm">
              <div className="flex items-center gap-2.5 mx-auto">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="font-bold text-foreground">Need help getting started?</span>
                <span className="hidden sm:inline text-secondary font-medium">• Watch the complete video tutorial & workflow guide</span>
                <Link to="/tutorials">
                  <Button size="sm" className="h-7 text-xs px-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-sm ml-2">
                    <Play className="w-3 h-3 fill-current" />
                    Watch Tutorial
                  </Button>
                </Link>
              </div>

              <button 
                onClick={() => setShowBanner(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="mx-auto max-w-5xl px-4 pb-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            Privacy note: this browser tool sends the selected file directly to the AI provider you choose. Tagyfy does not proxy or store your media, but provider terms apply. Use the Windows app when your files must remain on your device.
          </p>

          {/* Main Desktop Software Dashboard Engine */}
          <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
            <Dashboard />
          </main>
        </div>
      </AssetsProvider>
    </SettingsProvider>
  );
};

export default ToolPage;
