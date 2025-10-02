"use client";

import { Box, Container, Typography, IconButton, Divider } from "@mui/material";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { Facebook, Twitter, Instagram, Linkedin } from "iconoir-react";

interface FooterNav {
  label: string;
  items: Array<{ href: string; nameKey: string }>;
}

export function Footer() {
  const { t } = useTranslation();

  const footerNavs: FooterNav[] = [
    {
      label: t("footer.help.title"),
      items: [
        { href: "/contact", nameKey: "footer.help.contact" },
        { href: "/incidents", nameKey: "footer.help.incidents" },
        { href: "/faq", nameKey: "footer.help.faq" },
      ],
    },
    {
      label: t("footer.about.title"),
      items: [
        { href: "/history", nameKey: "footer.about.history" },
        { href: "/blog", nameKey: "footer.about.blog" },
        { href: "/collaborations", nameKey: "footer.about.collaborations" },
      ],
    },
    {
      label: t("footer.moreInfo.title"),
      items: [
        { href: "/terms", nameKey: "footer.moreInfo.terms" },
        { href: "/privacy", nameKey: "footer.moreInfo.privacy" },
        { href: "#", nameKey: "footer.moreInfo.address" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook width={24} height={24} strokeWidth={2} />, href: "https://facebook.com", label: "Facebook" },
    { icon: <Instagram width={24} height={24} strokeWidth={2} />, href: "https://instagram.com", label: "Instagram" },
    { icon: <Twitter width={24} height={24} strokeWidth={2} />, href: "https://twitter.com", label: "Twitter" },
    { icon: <Linkedin width={24} height={24} strokeWidth={2} />, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        bgcolor: "#3C4242",
        color: "#FFFFFF",
        pt: 8,
        pb: 6,
        fontFamily: theme.typography.fontFamily, // tipografía uniforme
      })}
    >
      {/* Full-bleed para que el color llegue a los bordes */}
      <Container maxWidth={false} disableGutters>
        {/* Full-width content */}
        <Box sx={{ px: { xs: 2, md: 3 } }}>
          {/* GRID de 3 columnas: bloque centrado, contenido alineado a la izquierda */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(260px, 1fr))", // columnas equilibradas
              },
              columnGap: { xs: 4, md: 8 },
              rowGap: 4,
              mb: 6,
              justifyContent: "center",               // centra el bloque de columnas
              justifyItems: { xs: "center", md: "start" }, // izquierda dentro de cada columna (md+)
              textAlign: { xs: "center", md: "left" },
              alignItems: "start",
            }}
          >
            {footerNavs.map((nav, idx) => (
              <Box key={idx}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, fontSize: 18, color: "#FFFFFF" }}
                >
                  {nav.label}
                </Typography>

                <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {nav.items.map((item, itemIdx) => (
                    <Box component="li" key={itemIdx} sx={{ mb: 1.5 }}>
                      {item.href === "#" ? (
                        <Typography
                          sx={{
                            color: "#D1D5DB",
                            fontSize: 15,
                            lineHeight: 1.6,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {t(item.nameKey)}
                        </Typography>
                      ) : (
                        <Typography
                          component={Link as any}
                          href={item.href}
                          sx={{
                            color: "#D1D5DB",
                            fontSize: 15,
                            lineHeight: 1.6,
                            textDecoration: "none",
                            transition: "color 0.2s ease",
                            "&:hover": { color: "#FFFFFF" },
                          }}
                        >
                          {t(item.nameKey)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Separador antes de iconos sociales */}
          <Divider
            sx={{
              my: 4,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />

          {/* Social links centrados */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 4 }}>
            {socialLinks.map((social, idx) => (
              <IconButton
                key={idx}
                component="a"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                sx={{
                  color: "#D1D5DB",
                  bgcolor: "rgba(255,255,255,0.05)",
                  width: 44,
                  height: 44,
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "#FFFFFF" },
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>

          {/* Separador antes del copyright */}
          <Divider
            sx={{
              mb: 3,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />

          {/* Copyright centrado */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#9CA3AF", fontSize: 14 }}>
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
