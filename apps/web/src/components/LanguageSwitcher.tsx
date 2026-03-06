"use client";

import { IconButton, Menu, MenuItem, Box } from '@mui/material';
import { Language } from 'iconoir-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export function LanguageSwitcher() {
  const { changeLanguage } = useTranslation();
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

  return (
    <Box>
      <IconButton
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        aria-label="Change language"
        size="small"
        sx={{
          color: 'rgba(0, 0, 0, 0.7)',
          '&:hover': {
            color: 'rgba(0, 0, 0, 0.9)',
            bgcolor: 'rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        <Language width={20} height={20} strokeWidth={2} />
      </IconButton>
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
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('es')}
        >
          🇪🇸 Español
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
        >
          🇺🇸 English
        </MenuItem>
      </Menu>
    </Box>
  );
}
