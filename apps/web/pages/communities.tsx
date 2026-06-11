import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { CommunityCard } from '@/components/CommunityCard';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { useTranslation } from '@/hooks/useTranslation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import { communitiesApi } from '@/shared/api/communities';
import { Community } from '@comparte-tu-tiempo/contracts';
import { Search } from '@mui/icons-material';

type VisibilityFilter = 'all' | 'public' | 'private';

export default function CommunitiesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();
  const { accessToken } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();

  const fetchCommunities = useCallback(async () => {
    await handleAsyncOperation(async () => {
      // Configure API client token if authenticated
      if (accessToken) {
        const { apiClient } = await import('@/shared/api/client');
        apiClient.setToken(accessToken);
      }

      const query = {
        page,
        pageSize,
        kind: 'COMMUNITY' as const,
        creatorId: activeTab === 1 && user?.sub ? user.sub : undefined,
        isPrivate: visibilityFilter === 'all' ? undefined : visibilityFilter === 'private',
      };

      const response = await communitiesApi.getCommunities(query);

      setCommunities(response.communities);
      setTotal(response.total);
    }, ERROR_MESSAGES.NETWORK_ERROR);
  }, [handleAsyncOperation, accessToken, page, pageSize, activeTab, user?.sub, visibilityFilter]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleCreateCommunity = () => {
    router.push('/communities/new');
  };

  const filteredCommunities = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return communities;

    return communities.filter((community) => {
      const name = community.name?.toLowerCase() ?? '';
      const description = community.description?.toLowerCase() ?? '';
      const topics = community.topics.join(' ').toLowerCase();
      return name.includes(normalizedSearch) || description.includes(normalizedSearch) || topics.includes(normalizedSearch);
    });
  }, [communities, searchTerm]);

  const handleJoinCommunity = (community: Community) => {
    router.push(`/communities/${community.id}?action=join`);
  };

  const resultCount = filteredCommunities.length;
  const pageContentSx = {
    width: '100%',
    maxWidth: 1240,
    mx: 'auto',
    px: { xs: 2, md: 3 },
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={pageContentSx}>
          {error && (
            <Box sx={{ mb: 3 }}>
              <ErrorAlert
                message={error}
                onRetry={fetchCommunities}
                onClose={clearError}
                retryText={t("common.retry")}
              />
            </Box>
          )}
          
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {/* Tab Controller */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px',
                    minHeight: '36px',
                    py: 1,
                    px: 2,
                  },
                  '& .Mui-selected': {
                    color: '#8A33FD',
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#8A33FD',
                  },
                }}
              >
                <Tab label={t("communities.tabs.all")} />
                <Tab 
                  label={t("communities.tabs.my_communities")} 
                  disabled={!user?.sub}
                />
              </Tabs>
              
              {/* Número de resultados y botón */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                  {loading
                    ? t('common.loading')
                    : `${resultCount}/${total} ${t('communities.title').toLowerCase()} ${t('common.found')}`}
                </Typography>
                
                {user && (
                  <Button 
                    variant="contained" 
                    onClick={handleCreateCommunity}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 600,
                      bgcolor: '#8A33FD',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(138, 51, 253, 0.3)',
                      '&:hover': {
                        bgcolor: '#7028E0',
                        boxShadow: '0 4px 12px rgba(138, 51, 253, 0.4)',
                      }
                    }}
                  >
                    + {t("communities.create")}
                  </Button>
                )}
              </Box>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, width: '100%' }}>
              <TextField
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`${t('common.search')} ${t('communities.title').toLowerCase()}...`}
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

              <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
                <InputLabel>{t('common.filter')}</InputLabel>
                <Select
                  value={visibilityFilter}
                  label={t('common.filter')}
                  onChange={(event) => {
                    setVisibilityFilter(event.target.value as VisibilityFilter);
                    setPage(1);
                  }}

                >
                  <MenuItem value="all">{t('communities.tabs.all')}</MenuItem>
                  <MenuItem value="public">{t('communities.public')}</MenuItem>
                  <MenuItem value="private">{t('communities.private')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 380px))',
                  justifyContent: 'center',
                  gap: 3,
                }}
              >
                {filteredCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onJoin={handleJoinCommunity}
                    showJoinAction={Boolean(user?.sub && community.creatorId !== user.sub)}
                  />
                ))}
              </Box>
            )}

            {!loading && filteredCommunities.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {communities.length > 0
                    ? `${t('common.not_found')}: ${t('communities.title').toLowerCase()}`
                    : activeTab === 1
                      ? t('communities.empty_states.no_my_communities')
                      : t('communities.empty_states.no_communities')}
                </Typography>
                {user && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button variant="outlined" onClick={handleCreateCommunity} sx={{ textTransform: 'none' }}>
                      {t('communities.empty_states.create_first')}
                    </Button>
                    {searchTerm && (
                      <Button
                        variant="text"
                        onClick={() => setSearchTerm('')}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('common.clear')}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
