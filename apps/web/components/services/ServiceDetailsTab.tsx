import { Box, Typography, Chip, Avatar } from '@mui/material';
import { CheckCircle } from 'iconoir-react';
import { useRouter } from 'next/router';
import { useTranslation } from '@/hooks/useTranslation';
import type { Service } from '@/types/service.types';

interface ServiceDetailsTabProps {
  service: Service;
}

export function ServiceDetailsTab({ service }: ServiceDetailsTabProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Box>
      {/* Chips de info (modalidad y disponibilidad) */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {service.type && (
          <Chip 
            label={service.type}
            size="small"
            variant="outlined"
            sx={{ 
              fontSize: '11px',
              height: '22px',
              borderColor: 'grey.300',
              color: 'text.secondary'
            }}
          />
        )}
        {service.availability && (
          <Chip 
            label={service.availability.replace('-', ' y ')}
            size="small"
            variant="outlined"
            sx={{ 
              fontSize: '11px',
              height: '22px',
              borderColor: 'grey.300',
              color: 'text.secondary',
              textTransform: 'capitalize'
            }}
          />
        )}
      </Box>

      {/* Detailed description */}
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
        {service.detailedDescription || service.description}
      </Typography>

      {/* Card de Intercambios (si hay) */}
      {service.totalExchanges !== undefined && service.totalExchanges > 0 && (
        <Box sx={{ 
          p: 1.5, 
          bgcolor: 'warning.50', 
          borderRadius: 1.5,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          mb: 2.5
        }}>
          <CheckCircle width={20} height={20} color="#ed6c02" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.dark', lineHeight: 1.2, fontSize: '13px' }}>
              {service.totalExchanges} {t('services.detail.exchangesCompleted')}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Provider information */}
      {service.user && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '11px', mb: 1, display: 'block' }}>
            {service.intent === 'REQUEST' ? t('services.detail.requester') : t('services.detail.provider')}
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              p: 1.5,
              bgcolor: 'grey.50',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'grey.100' }
            }}
            onClick={() => router.push(`/users/${service.user?.id || service.userId}`)}
          >
            <Avatar 
              src={service.user.imageUrl} 
              alt={service.user.name}
              sx={{ width: 40, height: 40 }}
            >
              {service.user.name[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                {service.user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                {service.user.location || t('services.detail.noLocation')}
              </Typography>
            </Box>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 600, fontSize: '11px' }}>
              {t('services.detail.viewProfile')} →
            </Typography>
          </Box>

          {service.user.skills && service.user.skills.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block', fontSize: '10px' }}>
                {t('services.detail.skills')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {service.user.skills.slice(0, 5).map((skill, idx) => (
                  <Chip key={idx} label={skill} size="small" variant="outlined" sx={{ fontSize: '10px', height: '20px' }} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

