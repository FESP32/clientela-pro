import CTABanner from "@/components/landing/cta-banner";
import FAQ from "@/components/landing/faq";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import { Navbar } from "@/components/navbar";
import Pricing from "@/components/landing/pricing";
import LoyaltyContentBlock from "@/components/landing/loyalty-content-block";
import FeatureSplit from "@/components/landing/feature-bridge";
import { FeedbackContentBlock } from "@/components/landing/feedback-content-block";
import Background from "@/components/common/background";


export default function Home() {
  
  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24 ">
        <Background />
        <Hero />
        <Features />
        <FeatureSplit imageSrc="/bridge_01.png" content={<LoyaltyContentBlock />} />
        <Pricing />
        <FeatureSplit order="image-right" imageSrc="/bridge_02.png" content={<FeedbackContentBlock />} />
        <FAQ />
        <CTABanner />
        <Footer />
      </main>
    </>
  );
}
