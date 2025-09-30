import { Header } from '@/widgets/header';
import { FindGeneralSections } from '@/components/FindGeneralSections';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <FindGeneralSections />
      <TestimonialsSection />
      <Footer />
    </>
  );
}

