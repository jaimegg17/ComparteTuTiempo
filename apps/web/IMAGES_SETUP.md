# 🖼️ Imágenes Requeridas para los Nuevos Componentes

## 📁 Ubicación: `apps/web/public/images/`

### 🎨 PromoBanner Component

#### **promo-left-bg.png**
- **Descripción**: Imagen de fondo para el lado izquierdo del banner promocional
- **Recomendación**: Imagen con hojas verdes oscuras (como Calathea) o patrón similar
- **Dimensiones**: Mínimo 800x400px
- **Formato**: PNG con transparencia opcional

#### **promo-right-bg.png**
- **Descripción**: Imagen de fondo para el lado derecho del banner promocional
- **Recomendación**: Imagen de personas jóvenes y diversas sonriendo (como en el diseño)
- **Dimensiones**: Mínimo 800x400px
- **Formato**: PNG o JPG

### 🎬 VideoPlaceholder Component

#### **video-thumbnail.png**
- **Descripción**: Imagen de fondo para el placeholder del video explicativo
- **Recomendación**: Screenshot o imagen representativa de la plataforma en uso
- **Dimensiones**: Mínimo 1200x400px
- **Formato**: PNG o JPG

## 🎯 Estructura Final de la Página de Inicio

```
1. HeroSection (ya existente)
2. FindGeneralSections (ya existente)
3. PromoBanner (NUEVO) ← Entre "Encuentra tu sección" y valoraciones
4. TestimonialsSection (ya existente)
5. VideoPlaceholder (NUEVO) ← Al final
```

## 🔧 Funcionalidades Implementadas

### ✅ PromoBanner
- **Layout**: Dos mitades (imagen + texto | imagen + botón)
- **Responsive**: Se adapta a móvil y desktop
- **Botón**: Redirige a `/services/create`
- **Traducciones**: Español e inglés
- **Efectos**: Hover, sombras, gradientes

### ✅ VideoPlaceholder
- **Layout**: Card centrado con botón de reproducción
- **Botón**: Circular con icono de play
- **Responsive**: Se adapta a diferentes pantallas
- **Traducciones**: Español e inglés
- **Efectos**: Hover, sombras, gradientes

## 🚀 Próximos Pasos

1. **Subir las imágenes** a `apps/web/public/images/`
2. **Probar la funcionalidad** en `http://localhost:3000`
3. **Implementar video real** (opcional, para más adelante)

## 📝 Notas Técnicas

- Los componentes usan **Material-UI** para consistencia
- **react-i18next** para traducciones
- **Next.js Router** para navegación
- **Responsive design** con breakpoints de MUI
- **Efectos CSS** para mejor UX
