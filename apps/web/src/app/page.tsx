import { LandingHeader } from "./_components/landing-header";
import { LandingHero } from "./_components/landing-hero";
import { LandingFeatures } from "./_components/landing-features";
import { LandingDepartments } from "./_components/landing-departments";
import { LandingFooter } from "./_components/landing-footer";

const Home = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <LandingHeader />
    <LandingHero />
    <LandingFeatures />
    <LandingDepartments />
    <LandingFooter />
  </div>
);

export default Home;
