import { useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { FaqSearch } from '@/components/faq/FaqSearch';
import { FaqCategoryAccordion } from '@/components/faq/FaqCategoryAccordion';
import type { FaqCategory } from '@/components/faq/types';

const FAQ_CONTENT: Record<'es' | 'en', FaqCategory[]> = {
  es: [
    {
      key: 'cuenta',
      title: 'Cuenta y perfil',
      items: [
        {
          question: '¿Cómo edito mi perfil?',
          answer: 'Ve a "Mi Perfil", actualiza tus datos y pulsa guardar.',
        },
        {
          question: '¿Puedo cambiar mi idioma?',
          answer: 'Sí. Usa el selector de idioma en la interfaz para cambiar entre español e inglés.',
        },
      ],
    },
    {
      key: 'servicios',
      title: 'Servicios e intercambios',
      items: [
        {
          question: '¿Cómo solicito un servicio?',
          answer: 'Entra en el detalle del servicio y pulsa "Solicitar Servicio".',
        },
        {
          question: '¿Cómo se completan los intercambios?',
          answer: 'Ambas partes deben seguir el flujo de estados: pendiente, confirmado, en progreso y completado.',
        },
      ],
    },
    {
      key: 'comunidades',
      title: 'Comunidades',
      items: [
        {
          question: '¿Cómo creo una comunidad?',
          answer: 'Desde la página de Comunidades, pulsa "Crear Comunidad" y completa el formulario.',
        },
        {
          question: '¿Quién puede editar una comunidad?',
          answer: 'Solo el creador de la comunidad puede editar su nombre, descripción y privacidad.',
        },
      ],
    },
  ],
  en: [
    {
      key: 'account',
      title: 'Account and profile',
      items: [
        {
          question: 'How do I edit my profile?',
          answer: 'Go to "My Profile", update your information, and save.',
        },
        {
          question: 'Can I change the language?',
          answer: 'Yes. Use the language switcher to move between Spanish and English.',
        },
      ],
    },
    {
      key: 'services',
      title: 'Services and exchanges',
      items: [
        {
          question: 'How do I request a service?',
          answer: 'Open the service detail page and click "Request Service".',
        },
        {
          question: 'How are exchanges completed?',
          answer: 'Both users must move the exchange through pending, confirmed, in-progress, and completed states.',
        },
      ],
    },
    {
      key: 'communities',
      title: 'Communities',
      items: [
        {
          question: 'How do I create a community?',
          answer: 'From Communities, click "Create Community" and complete the form.',
        },
        {
          question: 'Who can edit a community?',
          answer: 'Only the community creator can edit its name, description, and privacy.',
        },
      ],
    },
  ],
};

export default function FaqPage() {
  const { t, currentLanguage } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const languageKey: 'es' | 'en' = currentLanguage === 'en' ? 'en' : 'es';
  const categories = FAQ_CONTENT[languageKey];

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

  const subtitle =
    languageKey === 'es'
      ? 'Resuelve dudas frecuentes sobre cuenta, servicios y comunidades.'
      : 'Find answers about account, services, and communities.';
  const searchPlaceholder = languageKey === 'es' ? 'Buscar en FAQ...' : 'Search FAQ...';
  const noResults =
    languageKey === 'es'
      ? 'No se encontraron preguntas para tu búsqueda.'
      : 'No questions found for your search.';

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: 4 }}>
        <Box sx={{ maxWidth: 980, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {t('header.navigation.faq')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FaqSearch value={searchTerm} onChange={setSearchTerm} placeholder={searchPlaceholder} />
          </Box>

          {filteredCategories.length === 0 ? (
            <Typography color="text.secondary">{noResults}</Typography>
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
