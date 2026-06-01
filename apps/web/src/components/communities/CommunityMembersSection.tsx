import {
  Avatar,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { CommunityMembership, CommunityMembershipRole } from '@comparte-tu-tiempo/contracts';
import type { CommunityMembershipStatus } from '@comparte-tu-tiempo/contracts';

interface CommunityMembersSectionProps {
  memberships: CommunityMembership[];
  currentUserId?: string;
  canManage?: boolean;
  onRoleChange?: (membership: CommunityMembership, role: CommunityMembershipRole) => void;
  onStatusChange?: (membership: CommunityMembership, status: CommunityMembershipStatus) => void;
}

export function CommunityMembersSection({
  memberships,
  currentUserId,
  canManage = false,
  onRoleChange,
  onStatusChange,
}: CommunityMembersSectionProps) {
  const activeMemberships = memberships.filter((membership) => membership.status === 'ACTIVE');
  const pendingMemberships = memberships.filter((membership) => membership.status === 'PENDING');

  return (
    <Box sx={{ bgcolor: '#fff', p: { xs: 2.5, md: 3 }, borderRadius: 3, boxShadow: '0 12px 28px rgba(15,23,42,0.06)', border: '1px solid rgba(148,163,184,0.16)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Miembros
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeMemberships.length} integrantes activos en este espacio.
          </Typography>
        </Box>
      </Stack>

      {activeMemberships.length === 0 ? (
        <Typography color="text.secondary">No hay miembros registrados todavía.</Typography>
      ) : (
        <List sx={{ p: 0 }}>
          {activeMemberships.map((membership) => {
            const isCurrentUser = currentUserId === membership.userId;
            const primary = isCurrentUser ? 'Tú' : membership.userName || membership.userId;

            return (
              <ListItem
                key={membership.id}
                sx={{ px: 0, py: 1.2, borderBottom: '1px solid rgba(148,163,184,0.12)' }}
                secondaryAction={
                  canManage && onRoleChange && !isCurrentUser ? (
                    <Select
                      size="small"
                      value={membership.role}
                      onChange={(event) => onRoleChange(membership, event.target.value as CommunityMembershipRole)}
                      sx={{ minWidth: 130, borderRadius: 2 }}
                    >
                      <MenuItem value="OWNER">Owner</MenuItem>
                      <MenuItem value="MEMBER">Member</MenuItem>
                    </Select>
                  ) : (
                    <Chip size="small" label={membership.role} variant="outlined" />
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar src={membership.userImageUrl || undefined}>
                    {(membership.userName || membership.userId).substring(0, 1).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={primary}
                  secondary={`Alta: ${new Date(membership.joinedAt).toLocaleDateString('es-ES')}`}
                />
              </ListItem>
            );
          })}
        </List>
      )}

      {canManage && pendingMemberships.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            Solicitudes pendientes
          </Typography>
          <List sx={{ p: 0 }}>
            {pendingMemberships.map((membership) => (
              <ListItem
                key={`pending-${membership.id}`}
                sx={{ px: 0, py: 1.2, borderBottom: '1px solid rgba(148,163,184,0.12)' }}
                secondaryAction={
                  onStatusChange ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onStatusChange(membership, 'ACTIVE')}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onStatusChange(membership, 'SUSPENDED')}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Rechazar
                      </Button>
                    </Stack>
                  ) : (
                    <Chip size="small" label="PENDING" variant="outlined" />
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar src={membership.userImageUrl || undefined}>
                    {(membership.userName || membership.userId).substring(0, 1).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={membership.userName || membership.userId}
                  secondary={`Solicitud: ${new Date(membership.joinedAt).toLocaleDateString('es-ES')}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
