import { Layout } from '@/components/Layout';
import { HeroSection } from '@/components/HeroSection';
import { FindGeneralSections } from '@/components/FindGeneralSections';
import { PromoBanner } from '@/components/PromoBanner';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { VideoPlaceholder } from '@/components/VideoPlaceholder';
import { Box, Container } from '@mui/material';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <Box sx={{ bgcolor: '#ffffff' }}>
        <FindGeneralSections />
      </Box>
      <Box sx={{ bgcolor: '#f8fafc', borderTop: '1px solid rgba(148,163,184,0.12)', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, px: { xs: 2, md: 3 } }}>
          <PromoBanner />
        </Container>
      </Box>
      <TestimonialsSection />
      <Box sx={{ bgcolor: '#ffffff' }}>
        <VideoPlaceholder />
      </Box>
    </Layout>
  );
}
