import { Helmet } from "react-helmet-async";
import TutorialsSection from "@/components/TutorialsSection";

const Tutorials = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Tutorials & Video Guides | Tagyfy Pro</title>
      <meta
        name="description"
        content="Step-by-step video tutorials showing how to generate high-converting metadata, embed IPTC data into files, and use the Tagyfy Pro desktop app and Chrome extension."
      />
    </Helmet>
    <main>
      <TutorialsSection />
    </main>
  </div>
);

export default Tutorials;
