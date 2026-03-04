import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import type { FaqCategory } from './types';

interface FaqCategoryAccordionProps {
  category: FaqCategory;
}

export function FaqCategoryAccordion({ category }: FaqCategoryAccordionProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        {category.title}
      </Typography>

      {category.items.map((item, index) => (
        <Accordion key={`${category.key}-${index}`} disableGutters sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`${category.key}-${index}-content`}>
            <Typography sx={{ fontWeight: 600 }}>{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
