import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { CheckCircleRounded } from '@mui/icons-material';

interface CommunityRulesSectionProps {
  rules: string[];
}

export function CommunityRulesSection({ rules }: CommunityRulesSectionProps) {
  if (!rules.length) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: { xs: 2.5, md: 3 }, boxShadow: '0 12px 28px rgba(15,23,42,0.06)', border: '1px solid rgba(148,163,184,0.16)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        Reglas de la comunidad
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pautas básicas para mantener un espacio útil, amable y seguro.
      </Typography>

      <List disablePadding>
        {rules.map((rule, index) => (
          <ListItem key={`${rule}-${index}`} disableGutters sx={{ alignItems: 'flex-start', py: 1 }}>
            <ListItemIcon sx={{ minWidth: 30, mt: 0.25 }}>
              <CheckCircleRounded sx={{ color: '#8A33FD', fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary={rule} primaryTypographyProps={{ fontSize: 14, lineHeight: 1.6 }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
