import { Avatar, Box, Chip, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import type { Membership } from '@comparte-tu-tiempo/contracts';

interface CommunityMembersSectionProps {
  memberships: Membership[];
  currentUserId?: string;
}

export function CommunityMembersSection({ memberships, currentUserId }: CommunityMembersSectionProps) {
  const activeMemberships = memberships.filter((membership) => membership.status === 'ACTIVA');

  return (
    <Box sx={{ bgcolor: '#fff', p: { xs: 2.5, md: 3 }, borderRadius: 3, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Miembros
      </Typography>

      {activeMemberships.length === 0 ? (
        <Typography color="text.secondary">No hay miembros registrados todavía.</Typography>
      ) : (
        <List sx={{ p: 0 }}>
          {activeMemberships.slice(0, 8).map((membership) => {
            const isCurrentUser = currentUserId === membership.userId;
            return (
              <ListItem
                key={membership.id}
                sx={{ px: 0, borderBottom: '1px solid #f2f2f2' }}
                secondaryAction={<Chip size="small" label={membership.role} variant="outlined" />}
              >
                <ListItemAvatar>
                  <Avatar>{membership.userId.substring(0, 1).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={isCurrentUser ? 'Tú' : membership.userId}
                  secondary={`Alta: ${new Date(membership.joinedAt).toLocaleDateString('es-ES')}`}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}
