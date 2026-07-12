import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Courses from '@/components/landing/Courses';
import Progress from '@/components/landing/Progress';
import Leaderboard from '@/components/landing/Leaderboard';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Features />
        <Courses />
        <Progress />
        <Leaderboard />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
