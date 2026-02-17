import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Box, CircularProgress, Button, Tabs, Tab } from '@mui/material';
import { Layout } from '@/components/Layout';
import { CommunityCard } from '@/components/CommunityCard';
import { ErrorAlert } from '@/components/ui/BeautifulAlert';
import { useErrorHandling, ERROR_MESSAGES } from '@/hooks/useErrorHandling';
import { useTranslation } from '@/hooks/useTranslation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import { communitiesApi } from '@/shared/api/communities';
import { Community } from '@comparte-tu-tiempo/contracts';

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
  const { error, loading, handleAsyncOperation, clearError } = useErrorHandling();

  const fetchCommunities = async () => {
    await handleAsyncOperation(async () => {
      // Configure API client token if authenticated
      if (accessToken) {
        const { apiClient } = await import('@/shared/api/client');
        apiClient.setToken(accessToken);
      }

      const query = {
        page,
        pageSize,
        creatorId: activeTab === 1 && user?.sub ? user.sub : undefined,
        isPrivate: activeTab === 2 ? false : undefined, // Tab 2 = Public communities only
      };

      const response = await communitiesApi.getCommunities(query);
      
      // Backend returns: { message, communities: [...], total, page, pageSize, totalPages }
      // But our schema expects: { communities: [...], total, page, pageSize, totalPages }
      // Handle both structures
      const communities = Array.isArray(response.communities) 
        ? response.communities 
        : [];
      const total = response.total || communities.length;
      
      setCommunities(communities);
      setTotal(total);
    }, ERROR_MESSAGES.NETWORK_ERROR);
  };

  useEffect(() => {
    fetchCommunities();
  }, [activeTab, page]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleCreateCommunity = () => {
    // TODO: Navigate to create community page when implemented
    router.push('/communities/create');
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ px: { xs: 2, md: 3 } }}>
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
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                <Tab label={t("communities.tabs.public")} />
              </Tabs>
              
              {/* Número de resultados y botón */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                  {loading ? t("common.loading") : `${total} ${t("communities.title").toLowerCase()} ${t("common.found")}`}
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 2.5,
                }}
              >
                {communities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </Box>
            )}

            {!loading && communities.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {activeTab === 1 
                    ? t("communities.empty_states.no_my_communities")
                    : t("communities.empty_states.no_communities")
                  }
                </Typography>
                {user && (
                  <Button 
                    variant="outlined" 
                    onClick={handleCreateCommunity}
                    sx={{ textTransform: 'none' }}
                  >
                    {t("communities.empty_states.create_first")}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
