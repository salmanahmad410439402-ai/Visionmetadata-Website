import { Helmet } from "react-helmet-async";
import ContactSection from "@/components/ContactSection";

const ContactPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Contact & Support | Tagyfy Pro</title>
      <meta
        name="description"
        content="Contact Tagyfy Pro for help with licence keys, orders, refunds or bulk processing. Support is handled directly by the developer, with a reply typically within one working day."
      />
      <link rel="canonical" href="https://tagyfy.com/contact" />
    </Helmet>
    <main>
      <ContactSection />
    </main>
  </div>
);

export default ContactPage;
