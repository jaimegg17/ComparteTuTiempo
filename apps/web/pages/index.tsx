import { Layout } from '@/components/Layout';
import { HeroSection } from '@/components/HeroSection';
import { FindGeneralSections } from '@/components/FindGeneralSections';
import { PromoBanner } from '@/components/PromoBanner';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { VideoPlaceholder } from '@/components/VideoPlaceholder';
import { Container } from '@mui/material';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <FindGeneralSections />
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <PromoBanner />
      </Container>
      <TestimonialsSection />
      <VideoPlaceholder />
    </Layout>
  );
}

