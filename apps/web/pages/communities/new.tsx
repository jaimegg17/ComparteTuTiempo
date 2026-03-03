import { Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';

export default function NewCommunityPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 6 }}>
        <Box
          sx={{
            maxWidth: 720,
            mx: 'auto',
            px: { xs: 2, md: 3 },
            py: { xs: 3, md: 5 },
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 1,
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/communities')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            {t('common.back')}
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {t('communities.create')}
          </Typography>
          <Typography color="text.secondary">
            Esta vista es el punto de entrada para el formulario de creación (Fase C).
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
}
