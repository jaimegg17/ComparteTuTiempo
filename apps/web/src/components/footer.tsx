"use client";

import { Box, Container, Typography, IconButton, Divider } from "@mui/material";
import Link from "next/link";
import type { ElementType } from "react";
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
        { href: "/about#contact", nameKey: "footer.help.contact" },
        { href: "/about#scope", nameKey: "footer.help.incidents" },
        { href: "/faq", nameKey: "footer.help.faq" },
      ],
    },
    {
      label: t("footer.about.title"),
      items: [
        { href: "/about", nameKey: "footer.about.history" },
        { href: "/about#scope", nameKey: "footer.about.blog" },
        { href: "/about#purpose", nameKey: "footer.about.collaborations" },
      ],
    },
    {
      label: t("footer.moreInfo.title"),
      items: [
        { href: "/about#scope", nameKey: "footer.moreInfo.terms" },
        { href: "/about#scope", nameKey: "footer.moreInfo.privacy" },
        { href: "/about#contact", nameKey: "footer.moreInfo.address" },
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
        pt: { xs: 4.5, md: 6 },
        pb: { xs: 2.5, md: 3.5 },
        fontFamily: theme.typography.fontFamily,
      })}
    >
      <Container maxWidth={false} disableGutters>
        <Box sx={{ px: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              maxWidth: 1240,
              mx: "auto",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(180px, 1fr))",
              },
              columnGap: { xs: 2, md: 6 },
              rowGap: { xs: 2.5, md: 3 },
              mb: 3.5,
              justifyContent: "center",
              justifyItems: { xs: "center", md: "start" },
              textAlign: { xs: "center", md: "left" },
              alignItems: "start",
            }}
          >
            {footerNavs.map((nav, idx) => (
              <Box key={idx}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 1.1, fontSize: { xs: 15, md: 16 }, color: "#FFFFFF" }}
                >
                  {nav.label}
                </Typography>

                <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {nav.items.map((item, itemIdx) => (
                    <Box component="li" key={itemIdx} sx={{ mb: 1 }}>
                      {item.href === "#" ? (
                        <Typography
                          sx={{
                            color: "#D1D5DB",
                            fontSize: { xs: 13.5, md: 14 },
                            lineHeight: 1.55,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {t(item.nameKey)}
                        </Typography>
                      ) : (
                        <Typography
                          component={Link as ElementType}
                          href={item.href}
                          sx={{
                            color: "#D1D5DB",
                            fontSize: { xs: 13.5, md: 14 },
                            lineHeight: 1.55,
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

          <Divider
            sx={{
              maxWidth: 1240,
              mx: "auto",
              my: 2.5,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 1, md: 1.25 }, pb: 2.25, flexWrap: 'wrap' }}>
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
                  width: { xs: 36, md: 40 },
                  height: { xs: 36, md: 40 },
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "#FFFFFF" },
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>

          <Divider
            sx={{
              maxWidth: 1240,
              mx: "auto",
              mb: 2,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#9CA3AF", fontSize: 13 }}>
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
