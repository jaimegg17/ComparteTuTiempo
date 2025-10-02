"use client";

import { useState } from "react";
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
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  AccountCircle,
  Logout,
  SwapHoriz,
} from "@mui/icons-material";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchBar } from "@/components/SearchBar";

export function Header() {
  const { user, error, isLoading } = useUser();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
                <>
                  <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ 
                      ml: 1,
                      border: '2px solid',
                      borderColor: open ? 'primary.main' : 'rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                  >
                    <Avatar 
                      src={user.picture || undefined} 
                      alt={user.name || user.email || undefined}
                      sx={{ width: 32, height: 32 }}
                    >
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.name || user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {user.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} href="/perfil" sx={{ py: 1 }}>
                      <ListItemIcon>
                        <AccountCircle fontSize="small" />
                      </ListItemIcon>
                      Mi Perfil
                    </MenuItem>
                    <MenuItem component={Link} href="/exchanges" sx={{ py: 1 }}>
                      <ListItemIcon>
                        <SwapHoriz fontSize="small" />
                      </ListItemIcon>
                      Mis Intercambios
                    </MenuItem>
                    <Divider />
                    <MenuItem component={Link} href="/api/auth/logout" sx={{ py: 1, color: 'error.main' }}>
                      <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                      </ListItemIcon>
                      Cerrar Sesión
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Link href="/api/auth/login" style={{ textDecoration: "none" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LoginIcon />}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        px: 2.5,
                        py: 0.75,
                        borderColor: "rgba(0,0,0,0.2)",
                        color: "rgba(0,0,0,0.8)",
                        fontWeight: 500,
                        "&:hover": {
                          borderColor: "rgba(0,0,0,0.35)",
                          bgcolor: "rgba(255,255,255,0.4)",
                        },
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/api/auth/login" style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddIcon />}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        px: 2.5,
                        py: 0.75,
                        fontWeight: 500,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      Registrarse
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
