import { Layout } from '@/components/Layout';
import { FindGeneralSections } from '@/components/FindGeneralSections';
import { TestimonialsSection } from '@/components/TestimonialsSection';

export default function Home() {
  return (
    <Layout>
      <FindGeneralSections />
      <TestimonialsSection />
    </Layout>
  );
}

