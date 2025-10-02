import React, { useState, useRef } from 'react';
import { Box, Button, Typography, IconButton, Alert } from '@mui/material';
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage?: string;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, currentImage, disabled }: ImageUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      onImageSelect(null);
      setPreview(null);
      setError(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      {preview ? (
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={preview}
            alt="Service preview"
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'divider',
            }}
          />
          {!disabled && (
            <IconButton
              onClick={handleRemoveImage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.8)',
                },
              }}
              size="small"
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
      ) : (
        <Box
          onClick={disabled ? undefined : handleUploadClick}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'default' : 'pointer',
            bgcolor: 'grey.50',
            '&:hover': disabled ? {} : {
              borderColor: 'primary.main',
              bgcolor: 'grey.100',
            },
            transition: 'all 0.2s',
          }}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            {t("services.form.image_upload.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("services.form.image_upload.subtitle")}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            disabled={disabled}
            sx={{ textTransform: 'none' }}
          >
            {t("services.form.image_upload.button")}
          </Button>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {t("services.form.image_upload.help")}
      </Typography>
    </Box>
  );
}
