import { useMemo, useState } from 'react';
import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { Layout } from '@/components/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { FaqSearch } from '@/components/faq/FaqSearch';
import { FaqCategoryAccordion } from '@/components/faq/FaqCategoryAccordion';
import type { FaqCategory } from '@/components/faq/types';

const FAQ_CONTENT: Record<'es' | 'en', FaqCategory[]> = {
  es: [
    {
      key: 'cuenta',
      title: 'Cuenta, perfil y confianza',
      items: [
        {
          question: '¿Cómo completo un perfil que genere más confianza?',
          answer:
            'Añade una foto reconocible, una bio breve, tu ubicación aproximada, habilidades relevantes y una descripción clara de cómo sueles colaborar. Un perfil completo ayuda a que otras personas entiendan qué ofreces y mejora la confianza cuando publicas servicios o participas en comunidades.',
        },
        {
          question: '¿Qué información de mi perfil ven otras personas?',
          answer:
            'Las demás personas pueden ver la información necesaria para valorar si una colaboración tiene sentido, como nombre, imagen, ubicación general, bio, habilidades y actividad pública. Los datos sensibles o privados no deberían compartirse en abierto salvo que sea realmente necesario.',
        },
        {
          question: '¿Puedo cambiar el idioma de la plataforma?',
          answer:
            'Sí. La interfaz permite alternar entre español e inglés para adaptar la navegación, los textos principales y la ayuda a tu preferencia.',
        },
        {
          question: '¿Cómo sé si un perfil o un servicio parece fiable?',
          answer:
            'Antes de aceptar o solicitar un intercambio, revisa si el perfil está completo, si la descripción del servicio es clara, si hay ubicación aproximada, imagen y valoraciones, y si la propuesta explica bien qué incluye y qué no. También es buena práctica resolver dudas por chat antes de confirmar.',
        },
      ],
    },
    {
      key: 'servicios',
      title: 'Servicios, búsquedas y solicitudes',
      items: [
        {
          question: '¿Cómo encuentro servicios realmente útiles para mí?',
          answer:
            'Puedes usar la búsqueda por texto, los filtros por categoría, tipo o duración y la vista por cercanía. Si activas tu ubicación, la plataforma puede priorizar servicios próximos y mostrarlos también en el mapa para facilitar una exploración más práctica.',
        },
        {
          question: '¿Qué diferencia hay entre un servicio presencial, virtual e híbrido?',
          answer:
            'Un servicio presencial se realiza en una ubicación física, uno virtual se presta completamente online y uno híbrido combina ambos formatos. Revisar esta diferencia antes de solicitar un servicio ayuda a evitar malentendidos.',
        },
        {
          question: '¿Cómo solicito un servicio correctamente?',
          answer:
            'Abre el detalle del servicio, revisa descripción, ubicación y duración, y después usa la acción de solicitar. Si hay contexto importante o disponibilidad concreta, conviene incluir un mensaje breve desde el primer momento.',
        },
        {
          question: '¿Qué debería incluir una buena publicación de servicio?',
          answer:
            'Las mejores publicaciones explican con claridad qué se ofrece, a quién va dirigido, cuánto dura, si es presencial o virtual, qué resultados puede esperar la otra persona y si hay requisitos previos. Añadir imagen, ubicación y una descripción detallada mejora mucho la comprensión y la credibilidad.',
        },
        {
          question: '¿Por qué algunos servicios aparecen en el mapa y otros no?',
          answer:
            'Solo los servicios con una ubicación suficientemente definida pueden representarse correctamente en el mapa. Los servicios virtuales o sin coordenadas pueden seguir apareciendo en la lista, pero no en la vista geográfica.',
        },
      ],
    },
    {
      key: 'intercambios',
      title: 'Intercambios, mensajes y estados',
      items: [
        {
          question: '¿Qué ocurre después de enviar una solicitud?',
          answer:
            'La solicitud entra en el flujo de intercambio y la otra persona puede revisarla, aceptarla, rechazarla o continuar la conversación antes de confirmar. Esto permite aclarar expectativas antes de pasar a una colaboración real.',
        },
        {
          question: '¿Cómo se recomienda usar el chat dentro de un intercambio?',
          answer:
            'El chat debería utilizarse para concretar disponibilidad, formato, alcance del servicio y cualquier detalle práctico. Es útil dejar por escrito los acuerdos importantes para reducir fricciones posteriores.',
        },
        {
          question: '¿Qué significan los estados de un intercambio?',
          answer:
            'Normalmente el flujo pasa por pendiente, confirmado, en progreso y completado. Estos estados ayudan a que ambas partes sepan en qué punto está la colaboración y aportan trazabilidad al proceso.',
        },
        {
          question: '¿Qué hago si una solicitud deja de tener sentido o aparece un problema?',
          answer:
            'Lo recomendable es comunicarlo cuanto antes dentro del propio intercambio, explicando el motivo de forma clara y respetuosa. Cuanto antes se gestione una incidencia, más fácil será evitar frustraciones o trabajo perdido.',
        },
      ],
    },
    {
      key: 'comunidades',
      title: 'Comunidades y participación',
      items: [
        {
          question: '¿Para qué sirven las comunidades dentro de la plataforma?',
          answer:
            'Las comunidades agrupan personas con intereses, objetivos o contextos similares. Sirven para dar continuidad a las interacciones, generar pertenencia y descubrir colaboraciones más allá de una única solicitud puntual.',
        },
        {
          question: '¿Cómo creo una comunidad útil y no solo decorativa?',
          answer:
            'Una buena comunidad define un propósito claro, una audiencia concreta y unas normas implícitas de participación. También ayuda incluir una descripción que explique qué tipo de personas deberían entrar y qué valor pueden encontrar.',
        },
        {
          question: '¿Quién puede editar una comunidad?',
          answer:
            'Normalmente solo la persona creadora o quien tenga permisos equivalentes puede modificar el nombre, la descripción, la imagen y la configuración de privacidad.',
        },
        {
          question: '¿Qué diferencia hay entre una comunidad pública y una privada?',
          answer:
            'Una comunidad pública facilita el descubrimiento y el crecimiento, mientras que una privada permite trabajar con grupos más controlados o con un contexto más específico. Elegir una u otra depende del objetivo de participación.',
        },
      ],
    },
    {
      key: 'seguridad',
      title: 'Seguridad, privacidad y buenas prácticas',
      items: [
        {
          question: '¿Es recomendable compartir la dirección exacta desde el principio?',
          answer:
            'No. Lo más prudente es mostrar una ubicación general durante la fase de descubrimiento y compartir detalles concretos solo cuando el intercambio esté claro o confirmado. Esto mejora la privacidad y reduce exposición innecesaria.',
        },
        {
          question: '¿Cómo puedo evitar malentendidos al colaborar con otra persona?',
          answer:
            'Aclara siempre el alcance del servicio, la duración, el formato y el resultado esperado antes de avanzar. Cuanto más explícito sea el acuerdo previo, más fácil será que la experiencia sea satisfactoria para ambas partes.',
        },
        {
          question: '¿Qué señales indican que debería revisar mejor una propuesta antes de aceptarla?',
          answer:
            'Descripciones ambiguas, perfiles muy incompletos, cambios constantes en las condiciones o poca claridad al comunicarse son señales de que conviene hacer más preguntas antes de confirmar.',
        },
      ],
    },
  ],
  en: [
    {
      key: 'account',
      title: 'Account, profile and trust',
      items: [
        {
          question: 'How do I build a profile that feels trustworthy?',
          answer:
            'Add a recognizable photo, a short bio, your general location, relevant skills, and a clear explanation of how you usually collaborate. A complete profile helps other people understand what you offer and improves trust across the platform.',
        },
        {
          question: 'What parts of my profile are visible to other users?',
          answer:
            'People can usually see the information needed to assess whether collaborating with you makes sense, such as your name, image, general location, bio, skills, and public activity. Sensitive personal information should not be shared openly unless strictly necessary.',
        },
        {
          question: 'Can I change the platform language?',
          answer:
            'Yes. The interface supports switching between Spanish and English so navigation and help content match your preference.',
        },
        {
          question: 'How can I tell whether a profile or service looks reliable?',
          answer:
            'Review the profile completeness, service clarity, approximate location, ratings, and whether the description explains what is included. It is also a good idea to ask questions through chat before confirming an exchange.',
        },
      ],
    },
    {
      key: 'services',
      title: 'Services, discovery and requests',
      items: [
        {
          question: 'How do I find services that are actually relevant to me?',
          answer:
            'Use text search, category and type filters, duration filters, and nearby discovery. If location is enabled, the platform can prioritize nearby services and display them on the map for a more practical overview.',
        },
        {
          question: 'What is the difference between in-person, virtual and hybrid services?',
          answer:
            'In-person services happen at a physical location, virtual services are fully online, and hybrid services combine both. Understanding this before requesting a service helps avoid operational misunderstandings.',
        },
        {
          question: 'How should I request a service properly?',
          answer:
            'Open the service detail page, review the description, location and duration, and then send a request. If there are logistical details or specific expectations, include a short message to provide context from the start.',
        },
        {
          question: 'What makes a service listing feel professional and credible?',
          answer:
            'The strongest listings clearly explain the value offered, target audience, format, duration, expected outcome, and any prerequisites. Adding an image, a clear description and a usable location also improves credibility.',
        },
        {
          question: 'Why do some services appear on the map and others do not?',
          answer:
            'Only services with a sufficiently defined location can be shown accurately on the map. Virtual services or listings without coordinates may still appear in the list view but not in the geographic view.',
        },
      ],
    },
    {
      key: 'exchanges',
      title: 'Exchanges, messages and workflow',
      items: [
        {
          question: 'What happens after I send a request?',
          answer:
            'The request enters the exchange flow and the other user can review it, accept it, reject it, or continue the conversation before confirming. This gives both sides room to clarify expectations before committing.',
        },
        {
          question: 'How should messaging be used inside an exchange?',
          answer:
            'Messaging should be used to clarify availability, format, scope and practical details. Keeping important agreements in writing makes the collaboration easier to manage and reduces the risk of confusion.',
        },
        {
          question: 'What do exchange statuses usually mean?',
          answer:
            'The flow usually goes through pending, confirmed, in progress and completed. These statuses help both sides understand the current stage of the collaboration and keep the process visible.',
        },
        {
          question: 'What should I do if an exchange stops making sense or something goes wrong?',
          answer:
            'Communicate as early as possible inside the exchange, explain the situation clearly, and avoid leaving the other person without context. Early communication usually prevents most friction.',
        },
      ],
    },
    {
      key: 'communities',
      title: 'Communities and participation',
      items: [
        {
          question: 'What are communities for inside the platform?',
          answer:
            'Communities bring together people with shared interests, goals or contexts. They help create continuity, stronger participation and more collaboration opportunities beyond one-off requests.',
        },
        {
          question: 'How do I create a useful community instead of an empty one?',
          answer:
            'A strong community has a clear purpose, a defined audience and a description that explains what members can expect. Communities work better when they are built around real interaction, not just visibility.',
        },
        {
          question: 'Who can edit a community?',
          answer:
            'Usually only the creator or someone with equivalent permissions can edit the community name, description, image and privacy settings.',
        },
        {
          question: 'What is the difference between a public and a private community?',
          answer:
            'A public community is easier to discover and grow, while a private community is better for curated or sensitive participation contexts. The right choice depends on the goal of the group.',
        },
      ],
    },
    {
      key: 'safety',
      title: 'Safety, privacy and good practice',
      items: [
        {
          question: 'Should I share my exact address from the beginning?',
          answer:
            'Usually no. It is better to keep the location general during discovery and only share exact logistical details when the exchange is clear or confirmed. This improves privacy and reduces unnecessary exposure.',
        },
        {
          question: 'How can I reduce misunderstandings before collaborating?',
          answer:
            'Clarify the scope, duration, format and expected outcome before moving forward. The clearer the agreement is upfront, the smoother the collaboration tends to be.',
        },
        {
          question: 'Which signs suggest I should review a proposal more carefully before accepting?',
          answer:
            'Ambiguous descriptions, incomplete profiles, shifting conditions or unclear communication are all signs that you should ask more questions before confirming an exchange.',
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
      ? 'Resuelve dudas reales sobre uso de la plataforma, descubrimiento de servicios, intercambios, comunidades y buenas prácticas.'
      : 'Find practical answers about platform usage, service discovery, exchanges, communities, and good practice.';
  const searchPlaceholder = languageKey === 'es' ? 'Buscar por tema, flujo o problema...' : 'Search by topic, workflow, or issue...';
  const noResults =
    languageKey === 'es'
      ? 'No se encontraron preguntas para tu búsqueda.'
      : 'No questions found for your search.';
  const quickChips =
    languageKey === 'es'
      ? ['Perfil', 'Solicitudes', 'Mapa', 'Comunidades', 'Privacidad']
      : ['Profile', 'Requests', 'Map', 'Communities', 'Privacy'];

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
              CENTRO DE AYUDA
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
                {languageKey === 'es'
                  ? `${totalVisibleQuestions} preguntas visibles en ${filteredCategories.length} bloques`
                  : `${totalVisibleQuestions} visible questions across ${filteredCategories.length} sections`}
              </Typography>
              {searchTerm && (
                <Chip
                  label={languageKey === 'es' ? `Filtro activo: ${searchTerm}` : `Active filter: ${searchTerm}`}
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
