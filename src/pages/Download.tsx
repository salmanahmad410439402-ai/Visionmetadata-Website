import { Helmet } from "react-helmet-async";
import DownloadSection from "@/components/DownloadSection";

const DownloadPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Download Tagyfy Pro for Windows | Free Trial</title>
      <meta
        name="description"
        content="Download the Tagyfy Pro desktop application for Windows 10 and 11. Full-access 3-day free trial with AI-powered metadata generation and direct file embedding."
      />
    </Helmet>
    <main>
      <DownloadSection />
    </main>
  </div>
);

export default DownloadPage;
