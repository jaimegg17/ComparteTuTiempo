import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Avatar, Box, Button, Chip, CircularProgress, Paper, Stack, Typography, Alert } from '@mui/material';
import { Layout } from '@/components/Layout';
import { buildApiUrl } from '@/shared/api/config';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

type PublicUserProfile = {
  id: string;
  name: string;
  email?: string;
  location?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  imageUrl?: string | null;
  timeCredits?: number;
  createdAt?: string;
  _count?: {
    services?: number;
    ratings?: number;
    requestedExchanges?: number;
    offeredExchanges?: number;
  };
};

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { getAccessToken, user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessToken();
        const response = await fetch(buildApiUrl(`/users/profile/${encodeURIComponent(id)}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (response.status === 401) {
          router.push(`/api/auth/login?returnTo=${encodeURIComponent(router.asPath)}`);
          return;
        }

        if (!response.ok) {
          throw new Error(t('users.profile.loadError'));
        }

        const data = await response.json();
        setProfile(data.user);
      } catch (profileError) {
        setError(profileError instanceof Error ? profileError.message : t('users.profile.loadError'));
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [getAccessToken, id, router, t]);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!user && !profile && !error) {
    return null;
  }

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: { xs: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 920, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Button onClick={() => router.back()} sx={{ mb: 2, textTransform: 'none', fontWeight: 700 }}>
            ← {t('common.back')}
          </Button>

          {error || !profile ? (
            <Alert severity="error">{error || t('users.profile.notFound')}</Alert>
          ) : (
            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, boxShadow: '0 20px 55px rgba(15,23,42,0.08)' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                <Avatar src={profile.imageUrl || undefined} alt={profile.name} sx={{ width: 112, height: 112, fontSize: 40, bgcolor: '#8A33FD' }}>
                  {profile.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>

                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {profile.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {profile.location || t('services.detail.noLocation')}
                  </Typography>

                  {profile.bio && (
                    <Typography sx={{ lineHeight: 1.8, mb: 2.5 }}>
                      {profile.bio}
                    </Typography>
                  )}

                  {profile.skills && profile.skills.length > 0 && (
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                        {t('services.detail.skills')}
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
                        {profile.skills.map((skill) => (
                          <Chip key={skill} label={skill} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                    <Chip label={`${profile._count?.services || 0} ${t('users.profile.services')}`} color="primary" variant="outlined" />
                    <Chip label={`${profile._count?.ratings || 0} ${t('users.profile.ratings')}`} color="secondary" variant="outlined" />
                    <Chip label={`${(profile._count?.requestedExchanges || 0) + (profile._count?.offeredExchanges || 0)} ${t('users.profile.exchanges')}`} variant="outlined" />
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
