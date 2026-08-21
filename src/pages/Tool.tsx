import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AssetsProvider } from '@/contexts/AssetsContext';
import { Dashboard } from '@/components/software-ui/dashboard/Dashboard';
import { Play, Sparkles, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AdSense } from '@/components/AdSense';

export const ToolPage: React.FC = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Show top notification toast when webapp is opened
    const timer = setTimeout(() => {
      toast("🎬 Watch Step-by-Step Tutorial", {
        description: "Learn how to generate high-converting metadata and embed files in seconds.",
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

          {/* Main Desktop Software Dashboard Engine with Ads Layout */}
          <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col xl:flex-row gap-4">
            
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top Ad (Horizontal) */}
              <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl mb-4 overflow-hidden min-h-[90px] flex items-center justify-center p-2">
                 <AdSense format="horizontal" />
              </div>
              
              <Dashboard />
            </div>

            {/* Side Ad (Vertical, visible on Desktop) */}
            <aside className="hidden xl:flex flex-col w-[300px] shrink-0 gap-4">
              <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl h-[600px] sticky top-24 overflow-hidden flex items-center justify-center p-2">
                 <AdSense format="vertical" className="h-full" />
              </div>
            </aside>
            
          </main>
        </div>
      </AssetsProvider>
    </SettingsProvider>
  );
};

export default ToolPage;
