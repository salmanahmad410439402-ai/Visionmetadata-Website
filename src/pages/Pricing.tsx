import PricingSection from "@/components/PricingSection";
import Testimonials from "@/components/Testimonials";
import PaymentMethods from "@/components/PaymentMethods";

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <main>
      <PricingSection />
      <PaymentMethods />
      <Testimonials />
    </main>
  </div>
);

export default Pricing;
