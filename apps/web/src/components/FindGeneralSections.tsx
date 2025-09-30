"use client";

import { Box, Typography, Container } from "@mui/material";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

interface Section {
  id: string;
  titleKey: string;
  image: string;
  category: string;
}

export function FindGeneralSections() {
  const { t } = useTranslation();

  const sections: Section[] = [
    {
      id: "languages",
      titleKey: "sections.languages",
      image: "/images/sections/idiomas.png",
      category: "idiomas",
    },
    {
      id: "music",
      titleKey: "sections.music",
      image: "/images/sections/musica.png",
      category: "musica",
    },
    {
      id: "sports",
      titleKey: "sections.sports",
      image: "/images/sections/deporte.png",
      category: "deportes",
    },
    {
      id: "education",
      titleKey: "sections.education",
      image: "/images/sections/educacion.png",
      category: "educacion",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: 24, md: 28 },
            fontWeight: 600,
            color: "rgba(0, 0, 0, 0.87)",
            borderLeft: "4px solid",
            borderColor: "primary.main",
            pl: 2,
          }}
        >
          {t("sections.title")}
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
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
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
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  py: 2,
                  px: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "rgba(0, 0, 0, 0.87)",
                  }}
                >
                  {t(section.titleKey)}
                </Typography>
              </Box>
            </Box>
          </Link>
        ))}
      </Box>
    </Container>
  );
}
