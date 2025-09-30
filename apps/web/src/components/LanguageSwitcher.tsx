"use client";

import { Button, Menu, MenuItem, Box } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export function LanguageSwitcher() {
  const { changeLanguage, currentLanguage } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (locale: string) => {
    changeLanguage(locale);
    handleClose();
  };

  const getLanguageFlag = (locale: string) => {
    switch (locale) {
      case 'es':
        return '🇪🇸';
      case 'en':
        return '🇺🇸';
      default:
        return '🌐';
    }
  };

  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'es':
        return 'Español';
      case 'en':
        return 'English';
      default:
        return 'Language';
    }
  };

  return (
    <Box>
      <Button
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        sx={{
          color: 'text.primary',
          fontSize: '14px',
          textTransform: 'none',
          minWidth: 'auto',
          px: 1,
        }}
      >
        {getLanguageFlag(currentLanguage)} {getLanguageName(currentLanguage)}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('es')}
          selected={currentLanguage === 'es'}
        >
          🇪🇸 Español
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={currentLanguage === 'en'}
        >
          🇺🇸 English
        </MenuItem>
      </Menu>
    </Box>
  );
}
