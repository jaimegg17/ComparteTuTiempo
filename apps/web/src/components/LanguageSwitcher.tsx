"use client";

import { Button, Menu, MenuItem, ListItemText, ListItemIcon } from "@mui/material";
import { Language, NavArrowDown } from "iconoir-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const languageOptions = [
  { code: "es", label: "Español", short: "ES", flag: "🇪🇸" },
  { code: "en", label: "English", short: "EN", flag: "🇺🇸" },
];

export function LanguageSwitcher() {
  const { changeLanguage, currentLanguage } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const current = languageOptions.find((option) => option.code === currentLanguage) ?? languageOptions[0];

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
    <>
      <Button
        id="language-button"
        aria-controls={open ? "language-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        startIcon={<Language width={18} height={18} strokeWidth={2} />}
        endIcon={<NavArrowDown width={16} height={16} strokeWidth={2} />}
        size="small"
        sx={{
          minWidth: 0,
          borderRadius: 999,
          px: 1.25,
          py: 0.7,
          color: "rgba(15, 23, 42, 0.86)",
          border: "1px solid rgba(15, 23, 42, 0.10)",
          bgcolor: "rgba(255,255,255,0.42)",
          textTransform: "none",
          fontWeight: 700,
          fontSize: 13,
          whiteSpace: "nowrap",
          '&:hover': {
            bgcolor: "rgba(255,255,255,0.58)",
            borderColor: "rgba(15, 23, 42, 0.16)",
          },
          '& .MuiButton-startIcon': { mr: 0.7 },
          '& .MuiButton-endIcon': { ml: 0.4 },
        }}
      >
        {current.short}
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
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.2,
            borderRadius: 3,
            minWidth: 180,
            border: '1px solid rgba(148, 163, 184, 0.16)',
            boxShadow: '0 14px 30px rgba(15,23,42,0.14)',
          },
        }}
      >
        {languageOptions.map((option) => (
          <MenuItem
            key={option.code}
            selected={option.code === current.code}
            onClick={() => handleLanguageChange(option.code)}
            sx={{ py: 1.1 }}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>{option.flag}</ListItemIcon>
            <ListItemText
              primary={option.label}
              secondary={option.code === current.code ? "Idioma actual" : undefined}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              secondaryTypographyProps={{ fontSize: 12 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
