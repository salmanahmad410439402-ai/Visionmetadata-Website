import React from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AssetsProvider } from '@/contexts/AssetsContext';
import { Dashboard } from '@/components/software-ui/dashboard/Dashboard';
import { AdUnit } from '@/components/ads/AdUnit';

export const ToolPage: React.FC = () => {
  return (
    <SettingsProvider>
      <AssetsProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-16 sm:pt-20">
          {/* Main Desktop Software Dashboard Engine */}
          <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
            <Dashboard />
          </main>

          {/* AdSense Monetization Banner */}
          <footer className="w-full max-w-7xl mx-auto px-4 py-6">
            <AdUnit slotId="webtool-bottom-slot" className="max-w-4xl mx-auto" />
          </footer>
        </div>
      </AssetsProvider>
    </SettingsProvider>
  );
};

export default ToolPage;
