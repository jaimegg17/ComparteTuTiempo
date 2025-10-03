# 🎨 Hero Section - Instrucciones para Imagen de Fondo

## 📁 Ubicación de la Imagen

Para agregar tu imagen de fondo personalizada, coloca el archivo en:

```
apps/web/public/hero-background.jpg
```

## 🖼️ Especificaciones Recomendadas

- **Formato**: JPG, PNG o WebP
- **Resolución**: Mínimo 1920x1080px (Full HD)
- **Orientación**: Horizontal (landscape)
- **Tamaño**: Máximo 2MB para optimización
- **Contenido**: Imagen que represente comunidad, colaboración o intercambio de tiempo

## 🎯 Diseño Actual

El componente `HeroSection` está configurado con:

- **Fallback**: Gradiente púrpura-azul si no hay imagen
- **Overlay**: Capa semi-transparente para legibilidad del texto
- **Responsive**: Se adapta a móvil y desktop
- **Texto**: "Comparte tu tiempo" + "Conecta, comparte y aprende"
- **Botón**: "Empieza ya" que lleva a `/services`

## 🔧 Personalización

### Cambiar la imagen:
1. Reemplaza `hero-background.jpg` en `/public/`
2. O modifica la ruta en `HeroSection.tsx` línea 24

### Cambiar textos:
Edita las traducciones en:
- `apps/web/public/locales/es/common.json` (líneas 387-391)
- `apps/web/public/locales/en/common.json` (líneas 387-391)

### Cambiar colores:
Modifica los gradientes en `HeroSection.tsx` líneas 24 y 38

## ✅ Estado Actual

- ✅ Componente creado y funcional
- ✅ Integrado en página de inicio
- ✅ Responsive design implementado
- ✅ Traducciones agregadas
- ✅ Botón funcional (redirige a servicios)
- ⏳ Pendiente: Imagen de fondo personalizada

## 🚀 Próximos Pasos

1. Agrega tu imagen `hero-background.jpg` en `/public/`
2. Ajusta los textos si es necesario
3. Personaliza colores según tu marca
4. ¡Disfruta tu nueva sección hero! 🎉
