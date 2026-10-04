import { Helmet } from "react-helmet-async";
import PricingSection from "@/components/PricingSection";
import PaymentMethods from "@/components/PaymentMethods";
import PricingGuarantees from "@/components/PricingGuarantees";

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Pricing & License Plans | Tagyfy Pro</title>
      <meta
        name="description"
        content="Transparent pricing for Tagyfy Pro with lifetime and monthly license options. No hidden fees, free 3-day trial, and a 100% free Chrome extension for all contributors."
      />
      <link rel="canonical" href="https://tagyfy.com/pricing" />
    </Helmet>
    <main>
      <PricingSection />
      <PaymentMethods />
      <PricingGuarantees />
    </main>
  </div>
);

export default Pricing;
