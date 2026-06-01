import React, { useState, useRef, useCallback } from 'react';
import { Box, Button, Typography, IconButton, Alert, LinearProgress, CircularProgress } from '@mui/material';
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';
import { useUploadImage } from '@/shared/hooks/use-upload';
import { getFriendlyErrorMessage } from '@/shared/utils/error-messages';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useToast } from '@/components/ui/ToastProvider';

interface ImageUploadProps {
  onImageSelect?: (file: File | null) => void;
  onImageUploaded?: (url: string) => void;
  currentImage?: string;
  disabled?: boolean;
  autoUpload?: boolean; // If true, automatically upload when file is selected
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (must match API)

export function ImageUpload({ 
  onImageSelect, 
  onImageUploaded,
  currentImage, 
  disabled,
  autoUpload = false,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const { user, isLoading: userLoading } = useUser();
  const uploadImage = useUploadImage();
  const { showToast } = useToast();
  
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Formatos permitidos: JPEG, PNG, WebP, GIF';
    }

    if (file.size > MAX_FILE_SIZE) {
      return `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB. Elige otra o comprímela.`;
    }

    return null;
  };

  const createPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      onImageSelect?.(null);
      setPreview(null);
      setError(null);
      selectedFileRef.current = null;
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      showToast({ message: validationError, severity: 'warning' });
      return;
    }

    setError(null);
    selectedFileRef.current = file;
    createPreview(file);
    onImageSelect?.(file);

    // Auto-upload if enabled
    if (autoUpload) {
      // Check if user is authenticated
      if (!user && !userLoading) {
        const authError = 'Debes iniciar sesión para subir imágenes. Por favor, inicia sesión e inténtalo de nuevo.';
        setError(authError);
        showToast({ message: authError, severity: 'warning' });
        setPreview(null);
        selectedFileRef.current = null;
        return;
      }

      if (userLoading) {
        const loadingAuthError = 'Cargando autenticación... Espera un momento antes de subir la imagen.';
        setError(loadingAuthError);
        showToast({ message: loadingAuthError, severity: 'info' });
        return;
      }

      setUploadProgress(0);
      setError(null);
      let progressInterval: ReturnType<typeof setInterval> | null = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            progressInterval = null;
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const clearProgress = () => {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      };

      void (async () => {
        const result = await uploadImage.safeUploadImage(file);

        if (result.success) {
          clearProgress();
          setUploadProgress(100);
          onImageUploaded?.(result.data.url);
          // Reset progress after a short delay so it doesn't stay at "Subiendo imagen... 100%"
          setTimeout(() => setUploadProgress(0), 600);
          return;
        }

        clearProgress();
        const msg = getFriendlyErrorMessage(result.error, 'Error al subir la imagen. Inténtalo de nuevo.');
        setError(msg);
        showToast({ message: msg, severity: 'error' });
        setUploadProgress(0);
        selectedFileRef.current = file;
      })();
    }
  }, [autoUpload, onImageSelect, onImageUploaded, createPreview, uploadImage, user, userLoading, showToast]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileSelect(file || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    onImageSelect?.(null);
    selectedFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isUploading = uploadImage.isPending || uploadProgress > 0;

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />
      
      {preview ? (
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'divider',
              opacity: isUploading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          />
          
          {/* Upload Progress */}
          {isUploading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={40} />
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                {uploadProgress > 0 ? `${uploadProgress}%` : 'Subiendo...'}
              </Typography>
            </Box>
          )}

          {!disabled && !isUploading && (
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={disabled || isUploading ? undefined : handleUploadClick}
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: disabled || isUploading ? 'default' : 'pointer',
            bgcolor: isDragging ? 'primary.50' : 'grey.50',
            transition: 'all 0.2s',
            '&:hover': disabled || isUploading ? {} : {
              borderColor: 'primary.main',
              bgcolor: 'grey.100',
            },
          }}
        >
          <CloudUpload 
            sx={{ 
              fontSize: 48, 
              color: isDragging ? 'primary.main' : 'text.secondary', 
              mb: 2,
              transition: 'color 0.2s',
            }} 
          />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            {isDragging 
              ? 'Suelta la imagen aquí' 
              : t("services.form.image_upload.title") || 'Arrastra una imagen o haz clic para seleccionar'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("services.form.image_upload.subtitle") || 'Formatos: JPEG, PNG, WebP, GIF (máx. 10MB)'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            disabled={disabled || isUploading}
            sx={{ textTransform: 'none' }}
          >
            {t("services.form.image_upload.button") || 'Seleccionar imagen'}
          </Button>
        </Box>
      )}

      {/* Upload Progress Bar */}
      {isUploading && uploadProgress > 0 && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Subiendo imagen... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setError(null);
                setPreview(null);
                selectedFileRef.current = null;
                if (fileInputRef.current) fileInputRef.current.value = '';
                handleUploadClick();
              }}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {t("services.form.image_upload.help") || 'Dimensiones: mínimo 50x50px, máximo 6000x6000px. Tamaño máximo: 10MB.'}
      </Typography>
    </Box>
  );
}
