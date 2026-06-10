import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import type { FaqCategory } from './types';

interface FaqCategoryAccordionProps {
  category: FaqCategory;
}

export function FaqCategoryAccordion({ category }: FaqCategoryAccordionProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1rem', md: '1.05rem' } }}>
        {category.title}
      </Typography>

      {category.items.map((item, index) => {
        const panelId = `${category.key}-${index}-content`;
        const summaryId = `${category.key}-${index}-header`;

        return (
          <Accordion
            key={`${category.key}-${index}`}
            disableGutters
            elevation={0}
            sx={{
              mb: 1.25,
              borderRadius: '18px !important',
              overflow: 'hidden',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              id={summaryId}
              expandIcon={<ExpandMore />}
              aria-controls={panelId}
              sx={{
                px: { xs: 1.5, md: 2.25 },
                py: 0.5,
                '& .MuiAccordionSummary-expandIconWrapper': {
                  color: '#8A33FD',
                },
                '&.Mui-focusVisible': {
                  outline: '2px solid #8A33FD',
                  outlineOffset: '-2px',
                },
              }}
            >
              <Typography sx={{ fontWeight: 700, pr: 1.25, fontSize: { xs: '0.95rem', md: '1rem' } }}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails id={panelId} aria-labelledby={summaryId} sx={{ px: { xs: 1.5, md: 2.25 }, pb: 2.25, pt: 0 }}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7, fontSize: { xs: '0.94rem', md: '1rem' } }}>
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
