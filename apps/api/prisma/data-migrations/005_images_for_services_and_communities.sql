-- 005_images_for_services_and_communities.sql
-- Añade imágenes demo a servicios y comunidades existentes sin reescribir migraciones previas.

UPDATE services
SET "imageUrl" = CASE title
  WHEN 'Clases de Guitarra' THEN 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Limpieza del Hogar' THEN 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Desarrollo Web' THEN 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Entrenamiento Personal' THEN 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Clases de Yoga' THEN 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Reparación de Ordenadores' THEN 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Clases de Cocina Italiana' THEN 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Asesoría Legal Básica' THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Pintura de Interiores' THEN 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80'
  ELSE "imageUrl"
END
WHERE title IN (
  'Clases de Guitarra',
  'Limpieza del Hogar',
  'Desarrollo Web',
  'Entrenamiento Personal',
  'Clases de Yoga',
  'Reparación de Ordenadores',
  'Clases de Cocina Italiana',
  'Asesoría Legal Básica',
  'Pintura de Interiores'
);

UPDATE communities
SET "imageUrl" = CASE name
  WHEN 'Desarrolladores Madrid' THEN 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80'
  WHEN 'Músicos Barcelona' THEN 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80'
  ELSE "imageUrl"
END
WHERE name IN ('Desarrolladores Madrid', 'Músicos Barcelona');
