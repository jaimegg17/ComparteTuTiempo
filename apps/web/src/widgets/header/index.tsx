"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useUserProfileContext } from "@/contexts/UserProfileContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { communitiesApi } from "@/shared/api/communities";
import { apiClient } from "@/shared/api/client";
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
  Badge,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  Login as LoginIcon,
  AccountCircle,
  Logout,
  SwapHoriz,
  NotificationsActiveOutlined,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  const { displayName, displayEmail, displayImage } = useUserProfileContext();
  const { userProfile } = useUserProfile();
  const { unreadCount } = useNotifications(user?.sub);
  const { t } = useTranslation();
  const [pendingOrganizationsCount, setPendingOrganizationsCount] = useState(0);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMobileNavigate = (href: string) => {
    setMobileMenuOpen(false);
    void router.push(href);
  };

  const navItems = useMemo(() => {
    const items = [
      { href: "/", label: t("header.navigation.home") },
      { href: "/services", label: t("header.navigation.services") },
      { href: "/communities", label: t("header.navigation.communities") },
      { href: "/organizations", label: t("header.navigation.organizations") },
      { href: "/faq", label: t("header.navigation.faq") },
    ];

    if (user) {
      items.push({ href: "/exchanges", label: t("header.navigation.exchanges") });
    }

    return items;
  }, [t, user]);

  const isActive = (href: string) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const loadPendingOrganizations = async () => {
      if (userProfile?.role !== "ADMIN") {
        setPendingOrganizationsCount(0);
        return;
      }

      try {
        const token = await fetch("/api/auth/token", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data?.accessToken as string | undefined);

        if (!token) return;

        apiClient.setToken(token);
        const response = await communitiesApi.getPendingOrganizations();
        setPendingOrganizationsCount(response.communities.length);
      } catch {
        setPendingOrganizationsCount(0);
      }
    };

    void loadPendingOrganizations();
  }, [userProfile?.role]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#c9d5d3",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      <Container maxWidth={false} disableGutters>
        <Toolbar
          sx={{
            minHeight: { xs: 68, md: 74 },
            px: { xs: 1.5, md: 0 },
            py: { xs: 0.5, md: 0.75 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.25, md: 2 },
              width: "100%",
              maxWidth: 1320,
              mx: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", flex: { xs: "0 0 auto", md: "0 0 180px" }, mr: { xs: 0, md: 0 } }}>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                <Image
                  src="/images/logo.png"
                  alt="Comparte tu tiempo"
                  width={46}
                  height={46}
                  style={{ borderRadius: "50%", objectFit: "contain" }}
                />
              </Link>
            </Box>

            <Box
              component="nav"
              sx={{
                flex: "1 1 auto",
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 0.5, md: 0.85 },
                flexWrap: "wrap",
                minWidth: 0,
              }}
            >
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                    <Box
                      sx={{
                        px: { xs: 1.1, md: 1.5 },
                        py: { xs: 0.8, md: 0.95 },
                        borderRadius: 999,
                        bgcolor: active ? "rgba(138, 51, 253, 0.10)" : "transparent",
                        boxShadow: active ? "inset 0 0 0 1px rgba(138, 51, 253, 0.08)" : "none",
                        transition: "all 0.2s ease",
                        border: active ? "1px solid rgba(138, 51, 253, 0.18)" : "1px solid transparent",
                        '&:hover': {
                          bgcolor: active ? "rgba(138, 51, 253, 0.14)" : "rgba(15, 23, 42, 0.04)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.9 }}>
                        <Typography
                          sx={{
                            fontSize: { xs: 14, md: 15 },
                            fontWeight: active ? 700 : 600,
                            color: active ? "#8A33FD" : "rgba(15, 23, 42, 0.86)",
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </Typography>
                        {item.href === "/organizations" && userProfile?.role === "ADMIN" && pendingOrganizationsCount > 0 && (
                          <Badge
                            badgeContent={pendingOrganizationsCount}
                            color="secondary"
                            sx={{
                              '& .MuiBadge-badge': {
                                position: 'static',
                                transform: 'none',
                                fontSize: 10,
                                fontWeight: 800,
                                minWidth: 18,
                                height: 18,
                                px: 0.5,
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Link>
                );
              })}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.4, md: 0.9 },
                ml: { xs: "auto", md: 0 },
                flex: { xs: "0 0 auto", md: "0 0 220px" },
                justifyContent: "flex-end",
              }}
            >
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 0.2 }}
                aria-label="Abrir navegación"
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <LanguageSwitcher />
              </Box>

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
                  <Button
                    onClick={handleClick}
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    sx={{
                      minWidth: 0,
                      borderRadius: 999,
                      px: { xs: 0.5, md: 0.8 },
                      py: 0.45,
                      border: "1px solid",
                      borderColor: open ? "rgba(138, 51, 253, 0.26)" : "rgba(148, 163, 184, 0.22)",
                      bgcolor: open ? "rgba(138, 51, 253, 0.06)" : "#fff",
                      color: "text.primary",
                      gap: 1,
                      transition: "all 0.2s ease",
                      '&:hover': {
                        bgcolor: open ? "rgba(138, 51, 253, 0.08)" : "rgba(15,23,42,0.03)",
                        borderColor: open ? "rgba(138, 51, 253, 0.3)" : "rgba(148, 163, 184, 0.34)",
                      },
                    }}
                  >
                    <Avatar
                      src={displayImage || undefined}
                      alt={displayName || undefined}
                      sx={{ width: 34, height: 34 }}
                    >
                      {(displayName || "?")[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "flex-start", pr: 0.5 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.15, maxWidth: 110 }} noWrap>
                        {displayName}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: "text.secondary", lineHeight: 1.15, maxWidth: 110 }} noWrap>
                        {t("header.auth.profile")}
                      </Typography>
                    </Box>
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 220,
                        overflow: "visible",
                        borderRadius: 3,
                        border: "1px solid rgba(148, 163, 184, 0.16)",
                        filter: "drop-shadow(0px 12px 28px rgba(15,23,42,0.14))",
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
                          borderLeft: '1px solid rgba(148, 163, 184, 0.16)',
                          borderTop: '1px solid rgba(148, 163, 184, 0.16)',
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {displayEmail}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} href="/profile" sx={{ py: 1.1 }}>
                      <ListItemIcon>
                        <Badge badgeContent={unreadCount} color="secondary" invisible={unreadCount === 0}>
                          <AccountCircle fontSize="small" />
                        </Badge>
                      </ListItemIcon>
                      {t("header.auth.profile")}
                    </MenuItem>
                    <MenuItem component={Link} href="/exchanges" sx={{ py: 1.1 }}>
                      <ListItemIcon>
                        <SwapHoriz fontSize="small" />
                      </ListItemIcon>
                      {t("header.navigation.exchanges")}
                    </MenuItem>
                    {userProfile?.role === "ADMIN" && (
                      <MenuItem component={Link} href="/admin/inbox" sx={{ py: 1.1 }}>
                        <ListItemIcon>
                          <Badge
                            badgeContent={pendingOrganizationsCount}
                            color="secondary"
                            invisible={pendingOrganizationsCount === 0}
                          >
                            <NotificationsActiveOutlined fontSize="small" />
                          </Badge>
                        </ListItemIcon>
                        Inbox admin
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem component={Link} href="/api/auth/logout" sx={{ py: 1.1, color: "error.main" }}>
                      <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                      </ListItemIcon>
                      {t("header.auth.logout")}
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Link href="/api/auth/login" style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<LoginIcon />}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        px: 2.1,
                        py: 0.78,
                        fontWeight: 700,
                        boxShadow: "0 8px 20px rgba(138, 51, 253, 0.18)",
                        bgcolor: "#8A33FD",
                        '&:hover': {
                          bgcolor: "#7028E0",
                          boxShadow: "0 10px 24px rgba(138, 51, 253, 0.24)",
                        },
                      }}
                    >
                      {t("header.auth.login")}
                    </Button>
                  </Link>
                </Box>
              )}
            </Box>
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 'min(88vw, 340px)',
            p: 2,
            bgcolor: '#f8fafc',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            ComparteTuTiempo
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar navegación">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: { xs: 'flex', sm: 'none' }, mb: 2 }}>
          <LanguageSwitcher />
        </Box>

        <List sx={{ py: 0 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.href}
              onClick={() => handleMobileNavigate(item.href)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: isActive(item.href) ? 'rgba(138,51,253,0.10)' : 'transparent',
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: isActive(item.href) ? 800 : 600 }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 1.5 }} />

        {user ? (
          <List sx={{ py: 0 }}>
            <ListItemButton onClick={() => handleMobileNavigate('/profile')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemText primary={t('header.auth.profile')} secondary={displayEmail} />
            </ListItemButton>
            <ListItemButton component={Link} href="/api/auth/logout" sx={{ borderRadius: 2, color: 'error.main' }}>
              <ListItemText primary={t('header.auth.logout')} />
            </ListItemButton>
          </List>
        ) : (
          <Button
            component={Link}
            href="/api/auth/login"
            variant="contained"
            fullWidth
            startIcon={<LoginIcon />}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700, mt: 1 }}
          >
            {t('header.auth.login')}
          </Button>
        )}
      </Drawer>
    </AppBar>
  );
}
