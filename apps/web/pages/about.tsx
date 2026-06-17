import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { EmailOutlined, SchoolOutlined, VolunteerActivismOutlined } from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@compartetutiempo.app';

export default function AboutPage() {
  const { isEnglish } = useTranslation();

  const title = isEnglish()
    ? 'About ComparteTuTiempo'
    : 'Sobre ComparteTuTiempo';
  const subtitle = isEnglish()
    ? 'A final degree project focused on making time exchange easier, safer, and more useful for local communities.'
    : 'Un Trabajo de Fin de Grado enfocado en hacer que el intercambio de tiempo sea más sencillo, seguro y útil para comunidades locales.';

  const sections = isEnglish()
    ? [
        {
          title: 'What is this project?',
          body: 'ComparteTuTiempo is a time bank platform where people can publish offers and requests, contact each other, manage exchanges, join communities, and coordinate events using time as the main unit of value.',
        },
        {
          title: 'Why was it built?',
          body: 'The goal is to explore how a web application can support mutual aid, neighbourhood collaboration, and skill sharing while keeping the experience clear for non-technical users.',
        },
        {
          title: 'Current scope',
          body: 'The platform includes Auth0 authentication, service discovery, maps with graceful fallback, exchanges, chat, ratings, communities, organizations, events, notifications, and image uploads.',
        },
      ]
    : [
        {
          title: '¿Qué es este proyecto?',
          body: 'ComparteTuTiempo es una plataforma de banco de tiempo donde las personas pueden publicar ofertas y solicitudes, contactar entre sí, gestionar intercambios, unirse a comunidades y coordinar eventos usando el tiempo como unidad principal de valor.',
        },
        {
          title: '¿Por qué se ha desarrollado?',
          body: 'El objetivo es explorar cómo una aplicación web puede facilitar la ayuda mutua, la colaboración vecinal y el intercambio de habilidades manteniendo una experiencia clara para usuarios no técnicos.',
        },
        {
          title: 'Alcance actual',
          body: 'La plataforma incluye autenticación con Auth0, búsqueda de servicios, mapas con fallback, intercambios, chat, valoraciones, comunidades, organizaciones, eventos, notificaciones y subida de imágenes.',
        },
      ];

  return (
    <Layout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100%', py: { xs: 4, md: 7 } }}>
        <Box sx={{ width: '100%', maxWidth: 1040, mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              mb: 3,
              borderRadius: 4,
              overflow: 'hidden',
              p: { xs: 3, md: 5 },
              color: '#fff',
              background: 'linear-gradient(135deg, #3C4242 0%, #6D28D9 55%, #8A33FD 100%)',
              boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
            }}
          >
            <Chip
              icon={<SchoolOutlined fontSize="small" />}
              label={isEnglish() ? 'Final Degree Project' : 'Trabajo de Fin de Grado'}
              sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 800 }}
            />
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, fontSize: { xs: '2rem', md: '3rem' } }}>
              {title}
            </Typography>
            <Typography sx={{ maxWidth: 760, color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, fontSize: { xs: 16, md: 18 } }}>
              {subtitle}
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {sections.map((section, index) => (
              <Card
                id={index === 1 ? 'purpose' : index === 2 ? 'scope' : undefined}
                key={section.title}
                variant="outlined"
                sx={{ borderRadius: 3, boxShadow: '0 12px 28px rgba(15,23,42,0.06)' }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3.25 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <VolunteerActivismOutlined sx={{ color: '#8A33FD' }} />
                    <Typography variant="h6" sx={{ fontWeight: 850 }}>{section.title}</Typography>
                  </Stack>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>{section.body}</Typography>
                </CardContent>
              </Card>
            ))}

            <Card id="contact" variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 12px 28px rgba(15,23,42,0.06)' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.25 } }}>
                <Typography variant="h6" sx={{ fontWeight: 850, mb: 1 }}>
                  {isEnglish() ? 'Contact' : 'Contacto'}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                  {isEnglish()
                    ? 'If you want to ask about the project, report an issue, or provide feedback for the academic evaluation, you can use the contact email below.'
                    : 'Si quieres preguntar por el proyecto, comunicar una incidencia o aportar feedback para la evaluación académica, puedes usar el correo de contacto indicado abajo.'}
                </Typography>
                <Button
                  component="a"
                  href={`mailto:${contactEmail}`}
                  variant="contained"
                  startIcon={<EmailOutlined />}
                  sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#8A33FD', '&:hover': { bgcolor: '#7028E0' } }}
                >
                  {contactEmail}
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Layout>
  );
}
