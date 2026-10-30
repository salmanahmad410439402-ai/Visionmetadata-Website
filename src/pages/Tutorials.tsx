import { Helmet } from "react-helmet-async";
import TutorialsSection from "@/components/TutorialsSection";
import { JsonLd, breadcrumbSchema, videoTutorialSchema } from "@/lib/structuredData";

const Tutorials = () => (
  <div className="min-h-screen bg-background">
    <JsonLd
      data={[
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Tutorials & Video Guides", path: "/tutorials" },
        ]),
        videoTutorialSchema({
          videoId: "58nm1hZVvTs",
          name: "How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects",
          description:
            "Step-by-step tutorial explaining why multiple Gemini API keys inside a single Google Cloud project share the same quota limits, and how creating separate Google Cloud projects with one Gemini API key per project provides independent project quotas for AI tools and batch workflows.",
          uploadDate: "2026-10-30",
        }),
      ]}
    />
    <Helmet>
      <title>Tutorials & Video Guides — Gemini API Quota & Batch Setup | Tagyfy Pro</title>
      <meta
        name="description"
        content="Step-by-step video tutorials and written guides: learn how to get more free Google Gemini API quota across multiple Google Cloud projects, configure multi-key rotation, and run metadata batches in Tagyfy Pro."
      />
      <link rel="canonical" href="https://tagyfy.com/tutorials" />
    </Helmet>
    <main>
      <TutorialsSection />
    </main>
  </div>
);

export default Tutorials;
