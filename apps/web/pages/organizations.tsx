import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowOutwardRounded,
  PendingActionsOutlined,
  Search,
  VerifiedUserOutlined,
  VisibilityOutlined,
  Groups2Outlined,
} from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { CommunityCard } from '@/components/CommunityCard';
import { communitiesApi } from '@/shared/api/communities';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { apiClient } from '@/shared/api/client';
import type { Community } from '@comparte-tu-tiempo/contracts';

export default function OrganizationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { userProfile } = useUserProfile();
  const { accessToken } = useAuth();
  const [organizations, setOrganizations] = useState<Community[]>([]);
  const [pendingOrganizationsCount, setPendingOrganizationsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await communitiesApi.getCommunities({
        kind: 'ORGANIZATION',
        page: 1,
        pageSize: 24,
      });
      setOrganizations(response.communities);

      if (userProfile?.role === 'ADMIN' && accessToken) {
        apiClient.setToken(accessToken);
        const pendingResponse = await communitiesApi.getPendingOrganizations();
        setPendingOrganizationsCount(pendingResponse.communities.length);
      } else {
        setPendingOrganizationsCount(0);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('organizations.list.loadError'));
    } finally {
      setLoading(false);
    }
  }, [userProfile?.role, accessToken, t]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  const sortedOrganizations = useMemo(
    () => [...organizations].sort((a, b) => a.name.localeCompare(b.name)),
    [organizations],
  );

  const filteredOrganizations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return sortedOrganizations;

    return sortedOrganizations.filter((organization) => {
      const haystack = [organization.name, organization.description ?? '', organization.topics.join(' ')]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [sortedOrganizations, searchTerm]);

  const visibleTopics = useMemo(() => {
    const counts = new Map<string, number>();

    sortedOrganizations.forEach((organization) => {
      organization.topics.forEach((topic) => {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([topic]) => topic);
  }, [sortedOrganizations]);

  const summaryItems = useMemo(
    () => [
      {
        label: t('organizations.list.summaryVisible'),
        value: sortedOrganizations.length,
        icon: <VerifiedUserOutlined fontSize="small" />,
        tone: 'rgba(15,118,110,0.10)',
        color: '#0f766e',
      },
      {
        label: t('organizations.list.summaryTopics'),
        value: visibleTopics.length,
        icon: <Groups2Outlined fontSize="small" />,
        tone: 'rgba(138,51,253,0.10)',
        color: '#7A2EF6',
      },
      {
        label: t('organizations.list.summaryResults'),
        value: filteredOrganizations.length,
        icon: <VisibilityOutlined fontSize="small" />,
        tone: 'rgba(59,130,246,0.10)',
        color: '#2563eb',
      },
      ...(userProfile?.role === 'ADMIN'
        ? [
            {
              label: t('organizations.list.summaryPending'),
              value: pendingOrganizationsCount,
              icon: <PendingActionsOutlined fontSize="small" />,
              tone: pendingOrganizationsCount > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.12)',
              color: pendingOrganizationsCount > 0 ? '#b45309' : '#475569',
            },
          ]
        : []),
    ],
    [sortedOrganizations.length, visibleTopics.length, filteredOrganizations.length, userProfile?.role, pendingOrganizationsCount, t],
  );

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 1240, mx: 'auto', px: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box
            sx={{
              mb: 3,
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 20px 48px rgba(15,23,42,0.10)',
              border: '1px solid rgba(148,163,184,0.14)',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,243,255,0.98) 48%, rgba(240,249,255,0.98) 100%)',
            }}
          >
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={0}>
              <Box sx={{ flex: 1, p: { xs: 2.5, md: 4 } }}>
                <Chip
                  label={t('organizations.list.badge')}
                  size="small"
                  sx={{
                    mb: 1.5,
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    bgcolor: 'rgba(138,51,253,0.10)',
                    color: '#7A2EF6',
                  }}
                />
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.25, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.6rem' } }}>
                  {t('organizations.list.title')}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 760, mb: 2.5, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                  {t('organizations.list.subtitle')}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/organizations/new')}
                    endIcon={<ArrowOutwardRounded />}
                    sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 2.25 }}
                  >
                    {t('organizations.list.request')}
                  </Button>
                  {userProfile?.role === 'ADMIN' && (
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/admin/organizations')}
                      sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 2.25 }}
                    >
                      {t('organizations.list.review')}
                    </Button>
                  )}
                </Stack>
              </Box>

              <Box
                sx={{
                  width: { xs: '100%', lg: 360 },
                  borderLeft: { lg: '1px solid rgba(148,163,184,0.14)' },
                  borderTop: { xs: '1px solid rgba(148,163,184,0.14)', lg: 'none' },
                  bgcolor: 'rgba(255,255,255,0.65)',
                  p: { xs: 2.5, md: 3 },
                }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
                  {t('organizations.list.whatToExpect')}
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {(t('organizations.list.expectations', { returnObjects: true }) as string[]).map((item) => (
                    <Box
                      key={item}
                      sx={{
                        borderRadius: 2.5,
                        px: 1.75,
                        py: 1.5,
                        bgcolor: 'rgba(255,255,255,0.82)',
                        border: '1px solid rgba(148,163,184,0.14)',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {userProfile?.role === 'ADMIN' && pendingOrganizationsCount > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('organizations.list.pendingAlert', { count: pendingOrganizationsCount })}
            </Alert>
          )}

          <Box
            sx={{
              mb: 3,
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.16)',
              boxShadow: '0 16px 36px rgba(15,23,42,0.06)',
              p: { xs: 2.25, md: 3 },
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2.25 }}>
              <TextField
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('organizations.list.searchPlaceholder')}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="text"
                onClick={() => setSearchTerm('')}
                sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                {t('organizations.list.clearSearch')}
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap" sx={{ mb: 2.25, rowGap: 1.25 }}>
              {summaryItems.map((item) => (
                <Chip
                  key={item.label}
                  icon={item.icon}
                  label={`${item.label}: ${item.value}`}
                  sx={{
                    fontWeight: 800,
                    bgcolor: item.tone,
                    color: item.color,
                    '& .MuiChip-icon': { color: item.color },
                  }}
                />
              ))}
            </Stack>

            {visibleTopics.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {visibleTopics.map((topic) => (
                  <Chip
                    key={topic}
                    label={topic}
                    onClick={() => setSearchTerm(topic)}
                    sx={{
                      fontWeight: 700,
                      bgcolor: 'rgba(15,23,42,0.04)',
                      '&:hover': { bgcolor: 'rgba(138,51,253,0.10)' },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                justifyContent: 'stretch',
                gap: 3,
              }}
            >
              {filteredOrganizations.map((community) => (
                <CommunityCard key={community.id} community={community} detailBasePath="/organizations" />
              ))}
            </Box>
          )}

          {!loading && filteredOrganizations.length === 0 && (
            <Box
              sx={{
                mt: 3,
                bgcolor: '#fff',
                borderRadius: 3,
                border: '1px solid rgba(148,163,184,0.16)',
                boxShadow: '0 12px 28px rgba(15,23,42,0.06)',
                p: { xs: 2.5, md: 3 },
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                {t('organizations.list.emptyTitle')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {t('organizations.list.emptyDescription')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {t('organizations.list.clearSearch')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/organizations/new')}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {t('organizations.list.request')}
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
