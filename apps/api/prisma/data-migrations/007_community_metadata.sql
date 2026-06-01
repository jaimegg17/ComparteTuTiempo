-- 007_community_metadata.sql
-- Enriquecer comunidades demo con temas, reglas y recursos.

UPDATE communities
SET
  topics = CASE name
    WHEN 'Desarrolladores Frontend' THEN ARRAY['tecnología', 'frontend', 'react', 'career']
    WHEN 'Músicos Locales' THEN ARRAY['música', 'eventos', 'colaboración', 'producción']
    WHEN 'Creadoras Visuales' THEN ARRAY['diseño', 'fotografía', 'branding', 'portfolio']
    WHEN 'Entrena en Comunidad' THEN ARRAY['deporte', 'bienestar', 'hábitos', 'motivación']
    WHEN 'Freelancers Tech España' THEN ARRAY['tecnología', 'freelance', 'negocio', 'productividad']
    WHEN 'Cocina y Batch Cooking' THEN ARRAY['cocina', 'salud', 'hogar', 'rutinas']
    WHEN 'Aprender Idiomas Juntos' THEN ARRAY['idiomas', 'aprendizaje', 'intercambio', 'networking']
    WHEN 'Productividad y Hábitos' THEN ARRAY['productividad', 'hábitos', 'sistemas', 'foco']
    ELSE COALESCE(topics, ARRAY[]::TEXT[])
  END,
  rules = CASE name
    WHEN 'Desarrolladores Frontend' THEN ARRAY[
      'Comparte dudas o recursos con contexto suficiente para ayudar mejor.',
      'Mantén las críticas sobre código y portfolios en tono constructivo.',
      'Evita autopromoción repetitiva sin aportar valor a la comunidad.'
    ]
    WHEN 'Músicos Locales' THEN ARRAY[
      'Publica convocatorias y colaboraciones con fecha, ciudad y condiciones claras.',
      'Respeta tiempos y material compartido por otras personas del grupo.',
      'No uses la comunidad para spam de eventos sin relación con la escena local.'
    ]
    WHEN 'Creadoras Visuales' THEN ARRAY[
      'Comparte referencias con atribución cuando sea posible.',
      'Pide feedback indicando el objetivo del proyecto o la pieza.',
      'Respeta derechos de imagen y no subas trabajos ajenos como propios.'
    ]
    WHEN 'Entrena en Comunidad' THEN ARRAY[
      'Prioriza siempre seguridad, progresión y respeto por el nivel de cada persona.',
      'No compartas consejos de salud que sustituyan indicaciones profesionales.',
      'Usa el grupo para motivar y coordinar, no para competir de forma tóxica.'
    ]
    WHEN 'Freelancers Tech España' THEN ARRAY[
      'Comparte procesos, herramientas o aprendizajes aplicables al trabajo freelance.',
      'Sé transparente si publicas ofertas, colaboraciones o peticiones de ayuda.',
      'No recopiles contactos de otras personas sin su consentimiento.'
    ]
    WHEN 'Cocina y Batch Cooking' THEN ARRAY[
      'Comparte recetas indicando cantidades, tiempos y alergias relevantes.',
      'Las fotos y recursos deben estar relacionados con cocina práctica y realista.',
      'Procura que los consejos sean accesibles y fáciles de replicar en casa.'
    ]
    WHEN 'Aprender Idiomas Juntos' THEN ARRAY[
      'Alterna idiomas y tiempos de participación para que todo el mundo practique.',
      'Corrige con amabilidad y explica errores de forma sencilla.',
      'No conviertas la comunidad en un espacio de clases comerciales encubiertas.'
    ]
    WHEN 'Productividad y Hábitos' THEN ARRAY[
      'Comparte herramientas y sistemas que realmente hayas probado.',
      'Evita recetas milagro y promesas de productividad extrema.',
      'Mantén la conversación enfocada en hábitos sostenibles y medibles.'
    ]
    ELSE COALESCE(rules, ARRAY[]::TEXT[])
  END,
  resources = CASE name
    WHEN 'Desarrolladores Frontend' THEN '[
      {"title":"Checklist de revisión UI","description":"Guía breve para revisar jerarquía, spacing y estados antes de publicar una interfaz.","type":"link","url":"https://www.nngroup.com/articles/ten-usability-heuristics/"},
      {"title":"Directorio de recursos React","description":"Lista curada de librerías y patrones que usamos a menudo en la comunidad.","type":"note"}
    ]'::jsonb
    WHEN 'Músicos Locales' THEN '[
      {"title":"Plantilla de rider técnico básico","description":"Documento editable para preparar conciertos o colaboraciones pequeñas.","type":"note"},
      {"title":"Mapa de salas y open mics","description":"Enlace útil para localizar espacios donde tocar en varias ciudades.","type":"link","url":"https://www.google.com/maps"}
    ]'::jsonb
    WHEN 'Creadoras Visuales' THEN '[
      {"title":"Moodboard inspiración primavera","description":"Colección de referencias para campañas editoriales y retrato lifestyle.","type":"image","imageUrl":"https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"},
      {"title":"Plantilla de briefing creativo","description":"Útil para alinear objetivos, tono visual y entregables con clientes.","type":"note"}
    ]'::jsonb
    WHEN 'Entrena en Comunidad' THEN '[
      {"title":"Rutina full-body 30 minutos","description":"Propuesta sencilla para entrenar fuerza y movilidad tres días por semana.","type":"note"},
      {"title":"Guía para calentar mejor","description":"Artículo con pautas básicas para preparar articulaciones y evitar lesiones.","type":"link","url":"https://www.cdc.gov/physicalactivity/basics/index.htm"}
    ]'::jsonb
    WHEN 'Freelancers Tech España' THEN '[
      {"title":"Checklist onboarding cliente","description":"Pasos para arrancar proyectos con expectativas y entregables claros.","type":"note"},
      {"title":"Calculadora tarifa freelance","description":"Recurso para estimar tarifas sostenibles según costes y carga de trabajo.","type":"link","url":"https://www.freelancermap.com/blog/how-to-calculate-freelance-rate/"}
    ]'::jsonb
    WHEN 'Cocina y Batch Cooking' THEN '[
      {"title":"Plan semanal de batch cooking","description":"Ejemplo de planificación de 90 minutos para resolver varias comidas.","type":"note"},
      {"title":"Tabla de conservación de alimentos","description":"Referencia rápida para nevera, congelador y tuppers.","type":"link","url":"https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts"}
    ]'::jsonb
    WHEN 'Aprender Idiomas Juntos' THEN '[
      {"title":"Dinámicas para intercambios de conversación","description":"Ideas para que las sesiones no se queden en conversaciones repetitivas.","type":"note"},
      {"title":"Banco de prompts para speaking","description":"Preguntas y situaciones reales para practicar en grupo.","type":"link","url":"https://learnenglish.britishcouncil.org/skills/speaking"}
    ]'::jsonb
    WHEN 'Productividad y Hábitos' THEN '[
      {"title":"Plantilla revisión semanal","description":"Sistema simple para revisar foco, energía y objetivos cada viernes.","type":"note"},
      {"title":"Lectura recomendada sobre hábitos","description":"Artículo introductorio para diseñar hábitos sostenibles y medibles.","type":"link","url":"https://jamesclear.com/habits"}
    ]'::jsonb
    ELSE COALESCE(resources, '[]'::jsonb)
  END,
  "updatedAt" = NOW();
