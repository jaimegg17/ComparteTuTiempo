import { useMemo, useState } from 'react';
import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { FaqSearch } from '@/components/faq/FaqSearch';
import { FaqCategoryAccordion } from '@/components/faq/FaqCategoryAccordion';
import type { FaqCategory } from '@/components/faq/types';

export default function FaqPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = t('faq.categories', { returnObjects: true }) as FaqCategory[];

  const filteredCategories = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return categories;

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const question = item.question.toLowerCase();
          const answer = item.answer.toLowerCase();
          return question.includes(normalized) || answer.includes(normalized);
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, searchTerm]);

  const subtitle = t('faq.subtitle');
  const searchPlaceholder = t('faq.searchPlaceholder');
  const noResults = t('faq.noResults');
  const quickChips = t('faq.chips', { returnObjects: true }) as string[];

  const totalVisibleQuestions = filteredCategories.reduce((total, category) => total + category.items.length, 0);

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ maxWidth: 1040, mx: 'auto', px: { xs: 2, sm: 2.5, md: 3 } }}>
          <Paper
            sx={{
              mb: 3,
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f5ff 100%)',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.05)',
            }}
          >
            <Typography variant="overline" sx={{ color: '#8A33FD', fontWeight: 800, letterSpacing: '0.08em' }}>
              {t('faq.overline')}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.7rem', md: '2.125rem' } }}>
              {t('header.navigation.faq')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.5, maxWidth: 780, lineHeight: 1.7, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              {subtitle}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ rowGap: 1 }}>
              {quickChips.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  size="small"
                  onClick={() => setSearchTerm(chip)}
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ mb: 3, p: { xs: 1.5, sm: 2, md: 2.5 }, borderRadius: 4 }}>
            <FaqSearch value={searchTerm} onChange={setSearchTerm} placeholder={searchPlaceholder} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('faq.visibleCount', { questions: totalVisibleQuestions, sections: filteredCategories.length })}
              </Typography>
              {searchTerm && (
                <Chip
                  label={t('faq.activeFilter', { term: searchTerm })}
                  onDelete={() => setSearchTerm('')}
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                />
              )}
            </Stack>
          </Paper>

          {filteredCategories.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {noResults}
            </Alert>
          ) : (
            <Stack spacing={3}>
              {filteredCategories.map((category) => (
                <FaqCategoryAccordion key={category.key} category={category} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
