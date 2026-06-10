"use client";

import { Box, Typography, Container } from "@mui/material";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

interface Section {
  id: string;
  titleKey: string;
  image: string;
  category: string;
  subtitle: string;
}

export function FindGeneralSections() {
  const { t } = useTranslation();

  const sections: Section[] = [
    {
      id: "languages",
      titleKey: "sections.languages",
      image: "/images/sections/idiomas.jpg",
      category: "EDUCACION",
      subtitle: "Clases, conversación y apoyo para aprender idiomas",
    },
    {
      id: "music",
      titleKey: "sections.music",
      image: "/images/sections/musica.jpg",
      category: "ARTE",
      subtitle: "Instrumentos, canto, producción y creatividad musical",
    },
    {
      id: "sports",
      titleKey: "sections.sports",
      image: "/images/sections/deporte.jpg",
      category: "DEPORTES",
      subtitle: "Entrenamiento, bienestar y actividad física compartida",
    },
    {
      id: "education",
      titleKey: "sections.education",
      image: "/images/sections/estudios.jpg",
      category: "EDUCACION",
      subtitle: "Refuerzo académico, estudio guiado y formación práctica",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 }, px: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: 24, md: 30 },
            fontWeight: 700,
            color: "rgba(0, 0, 0, 0.87)",
            borderLeft: "4px solid",
            borderColor: "#8A33FD",
            pl: 2,
            mb: 1,
          }}
        >
          {t("sections.title")}
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 760, lineHeight: 1.7, pl: 2.5 }}>
          Explora algunas áreas destacadas para empezar a descubrir servicios, personas y oportunidades de intercambio con más contexto.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`/services?category=${section.category}`}
            style={{ textDecoration: "none" }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                aspectRatio: "1",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(148,163,184,0.18)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 18px 32px rgba(15, 23, 42, 0.14)",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.52) 100%)",
                  zIndex: 1,
                }}
              />
              <Box
                component="img"
                src={section.image}
                alt={t(section.titleKey)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  color: "#fff",
                  p: 2.25,
                }}
              >
                <Typography
                  sx={{
                    display: "inline-flex",
                    mb: 1,
                    px: 1.1,
                    py: 0.45,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  Ver servicios
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    mb: 0.5,
                  }}
                >
                  {t(section.titleKey)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  {section.subtitle}
                </Typography>
              </Box>
            </Box>
          </Link>
        ))}
      </Box>
    </Container>
  );
}
