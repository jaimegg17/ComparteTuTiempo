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
