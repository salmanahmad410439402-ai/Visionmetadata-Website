import { Helmet } from "react-helmet-async";
import ContactSection from "@/components/ContactSection";

const ContactPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Contact & Support | Tagyfy Pro</title>
      <meta
        name="description"
        content="Get help with Tagyfy Pro license keys, bulk processing, or technical support. Reach our team directly for fast assistance with your stock metadata workflow."
      />
    </Helmet>
    <main>
      <ContactSection />
    </main>
  </div>
);

export default ContactPage;
