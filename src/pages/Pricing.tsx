import { Helmet } from "react-helmet-async";
import PricingSection from "@/components/PricingSection";
import Testimonials from "@/components/Testimonials";
import PaymentMethods from "@/components/PaymentMethods";

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Pricing & License Plans | Tagyfy Pro</title>
      <meta
        name="description"
        content="Transparent pricing for Tagyfy Pro with lifetime and monthly license options. No hidden fees, free 3-day trial, and a 100% free Chrome extension for all contributors."
      />
    </Helmet>
    <main>
      <PricingSection />
      <PaymentMethods />
      <Testimonials />
    </main>
  </div>
);

export default Pricing;
