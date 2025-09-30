"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Container,
} from "@mui/material";
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  AccountCircle,
} from "@mui/icons-material";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchBar } from "@/components/SearchBar";

export function Header() {
  const { user, error, isLoading } = useUser();
  const { t } = useTranslation();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#c9d5d3",
        borderBottom: "1px solid",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      {/* FULL-BLEED: sin límites de ancho */}
      <Container maxWidth={false} disableGutters>
        <Toolbar
          sx={{
            minHeight: 72,
            px: { xs: 2, md: 3 }, // padding lateral del header
          }}
        >
          {/* Contenido centrado opcional: limita SOLO el contenido, no el fondo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
              maxWidth: 1440,   // ajusta si quieres más/menos ancho útil
              mx: "auto",
            }}
          >
            {/* IZQUIERDA: Logo */}
            <Box sx={{ display: "flex", alignItems: "center", mr: 1.5 }}>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
                <Image
                  src="/images/logo.png"
                  alt="Comparte tu tiempo"
                  width={48}
                  height={48}
                  style={{ borderRadius: "50%", objectFit: "contain" }}
                />
              </Link>
            </Box>

            {/* CENTRO: Navegación */}
            <Box
              component="nav"
              sx={{
                flex: "1 1 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: { xs: 3, md: 6 },
              }}
            >
              {[
                { href: "/", label: t("header.navigation.home") },
                { href: "/services", label: t("header.navigation.services") },
                { href: "/communities", label: t("header.navigation.communities") },
                { href: "/faq", label: t("header.navigation.faq") },
              ].map((item) => (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: "rgba(0,0,0,0.8)",
                      lineHeight: 1,
                      px: 0.5,
                      "&:hover": { color: "rgba(0,0,0,0.65)" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Link>
              ))}
            </Box>

            {/* DERECHA: Buscador + Idioma + Auth */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.25, md: 2 },
                pl: { xs: 1, md: 2 },
              }}
            >
              <SearchBar 
                placeholder={t("header.search.placeholder") || "Buscar"}
                width={{ xs: 200, md: 360 }}
                onSearch={(value) => {
                  // Handle search logic here
                  console.log("Search:", value);
                }}
              />

              <LanguageSwitcher />

              {isLoading ? (
                <Typography variant="body2" color="text.secondary">
                  {t("header.auth.loading")}
                </Typography>
              ) : error ? (
                <Typography variant="body2" color="error">
                  {t("header.auth.error", { message: error.message })}
                </Typography>
              ) : user ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ display: { xs: "none", md: "block" }, color: "rgba(0,0,0,0.8)" }}
                  >
                    {t("header.auth.welcome", { name: user.name || user.email })}
                  </Typography>
                  <Link href="/api/auth/logout" style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AccountCircle />}
                      sx={{ borderRadius: 999, textTransform: "none", px: 2, py: 0.75 }}
                    >
                      {t("header.auth.logout")}
                    </Button>
                  </Link>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Link href="/api/auth/login" style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<LoginIcon />}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        px: 2.25,
                        py: 0.75,
                        boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
                      }}
                    >
                      {t("header.auth.login")}
                    </Button>
                  </Link>
                  <Link href="/api/auth/login" style={{ textDecoration: "none" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PersonAddIcon />}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        px: 2,
                        py: 0.75,
                        borderColor: "rgba(0,0,0,0.2)",
                        color: "rgba(0,0,0,0.8)",
                        "&:hover": {
                          borderColor: "rgba(0,0,0,0.35)",
                          bgcolor: "rgba(255,255,255,0.4)",
                        },
                      }}
                    >
                      {t("header.auth.register")}
                    </Button>
                  </Link>
                </Box>
              )}
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
