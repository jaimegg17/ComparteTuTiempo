"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Search as SearchIcon, 
  AccountCircle,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  const { user, error, isLoading } = useUser();
  const { t } = useTranslation();

  return (
    <AppBar position="static" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar sx={{ 
          justifyContent: 'center', 
          py: 2, 
          px: 8, // Margen fijo a los lados (64px)
          minHeight: 80 // Altura mínima del header
        }}>
          {/* Contenido centrado con distribución equilibrada */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', // Centrado real
            width: '100%',
            maxWidth: '1200px', // Ancho máximo controlado
            mx: 'auto', // Centrado automático
            gap: 12 // Espacio fijo entre secciones principales (96px)
          }}>
            {/* Logo */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center'
            }}>
              <Button
                component={Link}
                href="/"
                sx={{ 
                  textDecoration: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  }
                }}
              >
                <Box
                  component="img"
                  src="/images/logo.png"
                  alt="ComparteTuTiempo Logo"
                  sx={{
                    width: 70,
                    height: 70,
                    objectFit: 'contain',
                  }}
                />
              </Button>
            </Box>

            {/* Navegación */}
            <Box sx={{ 
              display: { xs: 'none', lg: 'flex' }, 
              alignItems: 'center', 
              gap: 6 // Espacio entre botones (48px)
            }}>
              <Button 
                component={Link}
                href="/"
                color="inherit" 
                sx={{ fontSize: 22, color: 'text.primary', fontWeight: 500 }}
              >
                {t('header.navigation.home')}
              </Button>
              <Button 
                component={Link}
                href="/services"
                color="inherit" 
                sx={{ fontSize: 22, color: 'text.primary', fontWeight: 500 }}
              >
                {t('header.navigation.services')}
              </Button>
              <Button 
                component={Link}
                href="/communities"
                color="inherit" 
                sx={{ fontSize: 22, color: 'text.primary', fontWeight: 500 }}
              >
                {t('header.navigation.communities')}
              </Button>
              <Button 
                component={Link}
                href="/faq"
                color="inherit" 
                sx={{ fontSize: 22, color: 'text.primary', fontWeight: 500 }}
              >
                {t('header.navigation.faq')}
              </Button>
            </Box>

            {/* Acciones */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4 // Espacio entre elementos (32px)
            }}>
            {/* Barra de búsqueda */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <TextField
                size="small"
                placeholder={t('header.search.placeholder')}
                variant="outlined"
                sx={{ 
                  width: 280,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    fontSize: '16px',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Selector de idioma */}
            <LanguageSwitcher />

            {/* Estado de autenticación */}
            {isLoading && (
              <Typography variant="body2" color="text.secondary">
                {t('header.auth.loading')}
              </Typography>
            )}
            {error && (
              <Typography variant="body2" color="error">
                {t('header.auth.error', { message: error.message })}
              </Typography>
            )}
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    color: 'text.primary'
                  }}
                >
                  {t('header.auth.welcome', { name: user.name || user.email })}
                </Typography>
                <Link href="/api/auth/logout" style={{ textDecoration: 'none' }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<AccountCircle />}
                    sx={{ 
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }}
                  >
                    {t('header.auth.logout')}
                  </Button>
                </Link>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Link href="/api/auth/login" style={{ textDecoration: 'none' }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<LoginIcon />}
                    sx={{ 
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }}
                  >
                    {t('header.auth.login')}
                  </Button>
                </Link>
                <Link href="/api/auth/login" style={{ textDecoration: 'none' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<PersonAddIcon />}
                    sx={{ 
                      color: 'text.primary',
                      borderColor: 'grey.300',
                      '&:hover': {
                        borderColor: 'grey.400',
                        backgroundColor: 'background.default',
                      }
                    }}
                  >
                    {t('header.auth.register')}
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
          </Box>
        </Toolbar>

        {/* Navegación móvil */}
        <Box sx={{ 
          display: { xs: 'flex', lg: 'none' }, 
          justifyContent: 'center', 
          gap: 4, // Más espacio entre botones móviles
          py: 3, // Más padding vertical
          px: 6, // Mismo margen horizontal que el header principal
          borderTop: '1px solid', 
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}>
          <Button 
            component={Link}
            href="/"
            color="inherit" 
            sx={{ fontSize: 18, color: 'text.primary', fontWeight: 500 }}
          >
            {t('header.navigation.home')}
          </Button>
          <Button 
            component={Link}
            href="/services"
            color="inherit" 
            sx={{ fontSize: 18, color: 'text.primary', fontWeight: 500 }}
          >
            {t('header.navigation.services')}
          </Button>
          <Button 
            component={Link}
            href="/communities"
            color="inherit" 
            sx={{ fontSize: 18, color: 'text.primary', fontWeight: 500 }}
          >
            {t('header.navigation.communities')}
          </Button>
          <Button 
            component={Link}
            href="/faq"
            color="inherit" 
            sx={{ fontSize: 18, color: 'text.primary', fontWeight: 500 }}
          >
            {t('header.navigation.faq')}
          </Button>
        </Box>
      </Container>
    </AppBar>
  );
}