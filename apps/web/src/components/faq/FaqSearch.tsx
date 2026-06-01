import { InputAdornment, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

interface FaqSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function FaqSearch({ value, onChange, placeholder }: FaqSearchProps) {
  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      inputProps={{ 'aria-label': placeholder }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: { xs: 2.5, md: 3 },
          bgcolor: '#fff',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.05)',
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
}
