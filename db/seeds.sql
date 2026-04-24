-- =====================================================
-- Prompt Marketplace Database Seeds
-- Database: promptmk (SQLite/Turso)
-- =====================================================

-- SEED: User (25 users)
INSERT INTO User (username, email, password_hash, provider, provider_id, avatar_url, bio, aipoints) VALUES
('admin_prompt', 'admin@promptmk.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDE2', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'Platform administrator', 1000000),
('ai_master', 'aimaster@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDE3', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=aimaster', 'AI enthusiast and prompt engineer', 50000),
('prompt_wizard', 'wizard@outlook.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDE4', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=wizard', 'Creating magical prompts for LLMs', 35000),
('dev_ninja', 'ninja@dev.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDE5', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ninja', 'Full-stack developer', 28000),
('gpt_guru', 'guru@ai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDE6', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=guru', 'GPT expert and trainer', 42000),
('claude_lover', 'claude@love.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDE7', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=claude', 'Claude enthusiast', 31000),
('llama_wrangler', 'llama@tech.net', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDE8', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=llama', 'Open source AI advocate', 22000),
('mistral_fan', 'mistral@techlab.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDE9', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=mistral', 'Mistral AI model enthusiast', 38000),
('data_scientist', 'data@science.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF0', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=data', 'Data science prompt creator', 27000),
('code_crafter', 'craft@code.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF1', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=craft', 'Writing code with AI assistance', 24000),
('alex_ai', 'alex@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF2', 'google', 'google_123456', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'Tech lead and AI researcher', 55000),
('maria_dev', 'maria@github.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF3', 'github', 'github_789012', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', 'Software engineer', 33000),
('john_prompts', 'john@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF4', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'Prompt engineer', 29000),
('emma_creative', 'emma@creative.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF5', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', 'Creative writer and AI enthusiast', 40000),
('sam_tech', 'sam@techhub.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF6', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam', 'Technology consultant', 26000),
('lisa_data', 'lisa@dataflow.net', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF7', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', 'Data analyst', 21000),
('mike_engineer', 'mike@eng.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF8', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 'Systems engineer', 32000),
('sophia_learn', 'sophia@learn.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFDF9', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia', 'AI learning enthusiast', 18000),
('david_code', 'david@codebase.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFE0', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 'Backend developer', 30000),
('anna_marketing', 'anna@market.biz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFE1', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna', 'Marketing automation expert', 25000),
('ryan_research', 'ryan@research.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFE2', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan', 'Research scientist', 45000),
('olivia_design', 'olivia@designart.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFE3', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia', 'UX/UI designer', 23000),
('noah_finance', 'noah@fintech.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFE4', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=noah', 'Financial analyst', 36000),
('isabella_health', 'isabella@health.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFE5', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabella', 'Healthcare AI specialist', 28000),
('ethan_startup', 'ethan@startup.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4j.VTiHFE6', 'local', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ethan', 'Startup founder', 41000);

-- SEED: Tag (25 tags)
INSERT INTO Tag (name, slug, description) VALUES
('Mistral', 'mistral', 'Prompts optimizados para modelos Mistral AI'),
('Llama 3', 'llama-3', 'Prompts para modelos Meta LLaMA 3'),
('Code Generation', 'code-generation', 'Generación de código con IA'),
('Writing', 'writing', 'Prompts para escritura creativa y profesional'),
('Analysis', 'analysis', 'Prompts para análisis de datos y texto'),
('Summarization', 'summarization', 'Resumen y síntesis de textos largos'),
('Translation', 'translation', 'Traducción y localización de contenidos'),
('Chatbot', 'chatbot', 'Crear chatbots inteligentes con texto'),
('Customer Support', 'customer-support', 'Automatización de soporte al cliente'),
('Marketing', 'marketing', 'Prompts de marketing y ventas'),
('SEO', 'seo', 'Optimización para motores de búsqueda'),
('Education', 'education', 'Prompts educativos y de aprendizaje'),
('Research', 'research', 'Prompts para investigación académica'),
('Data Science', 'data-science', 'Ciencia de datos y machine learning'),
('Productivity', 'productivity', 'Aumenta tu productividad con IA'),
('Creative', 'creative', 'Prompts creativos y artísticos en texto'),
('Business', 'business', 'Negocios y emprendimiento'),
('Legal', 'legal', 'Generación de documentos legales'),
('Healthcare', 'healthcare', 'IA aplicada a salud y medicina'),
('Finance', 'finance', 'Análisis financiero con IA'),
('API Development', 'api-development', 'Diseño y desarrollo de APIs'),
('Prompt Engineering', 'prompt-engineering', 'Aprende y domina el prompt engineering'),
('Roleplay', 'roleplay', 'Prompts para juegos de rol y narrativas'),
('Gemma', 'gemma', 'Prompts para modelos Google Gemma'),
('Qwen', 'qwen', 'Prompts para modelos Qwen de Alibaba');

-- SEED: Prompt (25 prompts)
-- Modelos gratuitos de OpenRouter:
--   mistralai/mistral-7b-instruct:free
--   meta-llama/llama-3.1-8b-instruct:free
--   meta-llama/llama-3.2-3b-instruct:free
--   google/gemma-2-9b-it:free
--   qwen/qwen-2.5-7b-instruct:free
--   microsoft/phi-3-mini-128k-instruct:free
--   mistralai/mistral-nemo:free
--   openchat/openchat-7b:free
INSERT INTO Prompt (user_id, title, content, description, model, aipoints_price, upvotes, downvotes, uses_count, is_published) VALUES
(2, 'Asistente de Revisión de Código', 'Eres un revisor de código senior con 10 años de experiencia. Revisa el siguiente código e identifica:\n1. Problemas de rendimiento\n2. Vulnerabilidades de seguridad\n3. Calidad y legibilidad\n4. Buenas prácticas\n\nCódigo a revisar:\n{code}\n\nProporciona un informe detallado en texto con sugerencias concretas.', 'Revisión completa de código usando Mistral 7B', 'mistralai/mistral-7b-instruct:free', 350, 98, 3, 85, 1),
(2, 'Generador de Artículos SEO', 'Escribe un artículo SEO completo sobre {topic}.\n\nRequisitos:\n- Keyword principal: {keyword}\n- Número de palabras: {word_count}\n- Incluye subtítulos con H2 y H3\n- Densidad de keyword natural\n- Llamada a la acción al final\n- Tono: {tone}', 'Artículos SEO optimizados para posicionamiento', 'mistralai/mistral-7b-instruct:free', 400, 120, 4, 200, 1),
(3, 'Resumen Ejecutivo de Documentos', 'Resume el siguiente documento en un máximo de 300 palabras destacando:\n1. Puntos clave\n2. Conclusiones principales\n3. Elementos de acción\n4. Riesgos identificados\n\nDocumento:\n{document}\n\nEscribe el resumen en formato de párrafos claros y concisos.', 'Resume documentos largos en segundos', 'meta-llama/llama-3.1-8b-instruct:free', 200, 110, 2, 180, 1),
(3, 'Correo de Marketing Personalizado', 'Crea un correo de marketing convincente para:\nProducto: {product_name}\nAudiencia objetivo: {audience}\nObjetivo: {goal}\n\nIncluye:\n- Asunto atractivo\n- Cuerpo del mensaje con enganche inicial\n- Propuesta de valor clara\n- CTA específico\n- Posdata con urgencia', 'Correos de marketing de alta conversión', 'meta-llama/llama-3.1-8b-instruct:free', 300, 88, 5, 160, 1),
(4, 'Guión de Soporte al Cliente', 'Eres un agente de soporte empático para {company}.\n\nPolíticas de la empresa:\n{company_policies}\n\nConsulta del cliente:\n{customer_query}\n\nResponde de forma empática, profesional y resuelve el problema. Si no puedes resolverlo, escala correctamente.', 'Respuestas automáticas de soporte al cliente', 'mistralai/mistral-nemo:free', 250, 75, 6, 140, 1),
(4, 'Generador de Preguntas de Entrevista', 'Genera preguntas de entrevista para:\nPuesto: {position}\nNivel de experiencia: {level}\nÁreas clave: {focus_areas}\n\nIncluye:\n- Preguntas conductuales (método STAR)\n- Preguntas técnicas\n- Escenarios de resolución de problemas\n- Preguntas de cultura organizacional', 'Banco de preguntas para entrevistas laborales', 'google/gemma-2-9b-it:free', 200, 65, 2, 100, 1),
(5, 'Análisis de Datos con Texto', 'Analiza el siguiente conjunto de datos y proporciona insights en texto:\n\nDatos:\n{data}\n\nProporciona:\n1. Estadísticas descriptivas en texto\n2. Patrones y tendencias identificadas\n3. Anomalías detectadas\n4. Recomendaciones accionables\n\nUsa lenguaje claro y evita jerga técnica.', 'Análisis de datos explicado en lenguaje natural', 'meta-llama/llama-3.1-8b-instruct:free', 500, 130, 7, 100, 1),
(5, 'Resumen de Documentos Legales', 'Resume el siguiente documento legal destacando:\n1. Términos y condiciones clave\n2. Fechas y plazos importantes\n3. Riesgos potenciales para cada parte\n4. Obligaciones de cada parte\n5. Cláusulas inusuales o problemáticas\n\nDocumento:\n{legal_document}', 'Resúmenes rápidos de documentos legales', 'mistralai/mistral-7b-instruct:free', 450, 95, 3, 90, 1),
(6, 'Escritor de Posts de Blog', 'Expande el siguiente esquema en un post de blog completo:\n\nEsquema:\n{outline}\n\nEstilo: {style}\nExtensión: {length} palabras\nAudiencia: {audience}\n\nEscribe en tono conversacional, usa ejemplos reales y finaliza con una reflexión o pregunta al lector.', 'Convierte esquemas en posts de blog completos', 'qwen/qwen-2.5-7b-instruct:free', 300, 85, 4, 145, 1),
(6, 'Documentación de API en Texto', 'Genera documentación completa en texto para:\n\nEndpoint: {endpoint}\nMétodo HTTP: {method}\nParámetros: {parameters}\nAutenticación: {auth_type}\n\nIncluye descripción del endpoint, ejemplos de uso en texto plano, códigos de error y buenas prácticas.', 'Documenta APIs automáticamente en texto', 'mistralai/mistral-7b-instruct:free', 350, 70, 2, 75, 1),
(7, 'Esquema de Paper Académico', 'Crea un esquema detallado para un paper académico sobre:\n\nTema: {topic}\nNivel académico: {level}\nEstilo de citación: {citation_style}\n\nEstructura debe incluir abstract, revisión de literatura, metodología, hallazgos y conclusión con al menos 3 puntos por sección.', 'Estructura papers académicos fácilmente', 'google/gemma-2-9b-it:free', 400, 88, 4, 95, 1),
(7, 'Traductor con Contexto Cultural', 'Traduce el siguiente texto de {source_lang} a {target_lang}:\n\nTexto:\n{text}\n\nConsiderations:\n- Contexto: {context}\n- Tono: {tone}\n- Audiencia objetivo: {audience}\n\nAdapta expresiones idiomáticas para que sean culturalmente apropiadas.', 'Traducciones precisas con adaptación cultural', 'mistralai/mistral-nemo:free', 250, 78, 3, 130, 1),
(8, 'Asistente de Migración de Código', 'Eres un experto en migración. Explica paso a paso cómo convertir el siguiente código de {source_lang} a {target_lang}:\n\n{code}\n\nDescribe:\n1. Equivalencias de funciones\n2. Patrones idiomáticos del lenguaje destino\n3. Posibles trampas y cómo evitarlas\n4. Pasos de validación', 'Guías detalladas para migrar código entre lenguajes', 'meta-llama/llama-3.1-8b-instruct:free', 550, 100, 3, 80, 1),
(8, 'Verificador de Síntomas Médicos', 'Eres un asistente de información médica. Con base en los síntomas:\n{symptoms}\n\nProporciona en texto:\n1. Posibles condiciones relacionadas\n2. Cuándo buscar atención inmediata\n3. Recomendaciones generales de bienestar\n\nNota: Esta información no reemplaza la consulta médica profesional.', 'Información médica responsable en texto', 'microsoft/phi-3-mini-128k-instruct:free', 500, 115, 8, 110, 1),
(9, 'Reporte de Análisis Financiero', 'Analiza los siguientes datos financieros y genera un reporte en texto:\n{financial_data}\n\nIncluye:\n1. Ratios financieros clave explicados en lenguaje simple\n2. Análisis de tendencias\n3. Evaluación de riesgos\n4. Recomendaciones de inversión con justificación', 'Reportes financieros en lenguaje accesible', 'qwen/qwen-2.5-7b-instruct:free', 600, 92, 5, 70, 1),
(9, 'Generador de Contenido para Redes Sociales', 'Crea un calendario de contenido de 30 días para:\nPlataforma: {platform}\nNicho: {niche}\nVoz de marca: {voice}\n\nPara cada día especifica:\n- Tipo de publicación\n- Tema\n- Texto del caption completo\n- Hashtags recomendados', 'Planifica contenido para redes sociales en texto', 'openchat/openchat-7b:free', 350, 95, 4, 135, 1),
(10, 'Escritor de Historias Cortas', 'Escribe una historia corta de {genre} con:\nPersonaje principal: {protagonist}\nConflicto central: {conflict}\nAmbientación: {setting}\nExtensión: {length} palabras\n\nLa historia debe tener introducción, nudo y desenlace claro. Usa diálogos para dar vida a los personajes.', 'Historias cortas creativas con IA', 'meta-llama/llama-3.2-3b-instruct:free', 200, 80, 3, 120, 1),
(10, 'Guía de Aprendizaje Personalizada', 'Crea una ruta de aprendizaje personalizada para:\nHabilidad: {skill}\nNivel actual: {level}\nTiempo disponible: {time} por semana\nObjetivo: {goal}\n\nIncluye hitos mensuales, recursos recomendados, ejercicios prácticos y criterios para medir el progreso.', 'Planes de aprendizaje a medida', 'google/gemma-2-9b-it:free', 350, 82, 3, 110, 1),
(11, 'Documento de Requisitos de Producto (PRD)', 'Crea un PRD detallado para:\nProducto: {product_name}\nObjetivo: {goal}\nUsuarios objetivo: {target_users}\n\nIncluye:\n- Historias de usuario\n- Requisitos funcionales\n- Criterios de aceptación\n- Métricas de éxito\n- Supuestos y restricciones', 'PRDs completos para equipos de producto', 'mistralai/mistral-7b-instruct:free', 450, 80, 3, 60, 1),
(12, 'Análisis Competitivo de Mercado', 'Realiza un análisis competitivo para:\nEmpresa: {company}\nIndustria: {industry}\nCompetidores a analizar: {competitors}\n\nProporciona en texto:\n- Fortalezas y debilidades de cada competidor\n- Oportunidades de diferenciación\n- Recomendaciones estratégicas', 'Análisis de competencia en texto estructurado', 'meta-llama/llama-3.1-8b-instruct:free', 500, 72, 4, 65, 1),
(13, 'Generador de Casos de Uso', 'Genera casos de uso detallados para:\nSistema: {system_name}\nRol de usuario: {user_role}\nFuncionalidad: {feature}\n\nPara cada caso de uso incluye:\n- Precondiciones\n- Flujo principal paso a paso\n- Flujos alternativos\n- Postcondiciones\n- Excepciones', 'Casos de uso bien estructurados en texto', 'qwen/qwen-2.5-7b-instruct:free', 300, 68, 2, 90, 1),
(14, 'Resumen de Libros de No Ficción', 'Proporciona un resumen completo de:\nLibro: {book_title}\nAutor: {author}\n\nIncluye en texto:\n- Tesis principal\n- Capítulos y sus ideas clave\n- Aprendizajes prácticos\n- Citas relevantes parafraseadas\n- Aplicaciones reales', 'Resúmenes profundos de libros de no ficción', 'mistralai/mistral-nemo:free', 300, 88, 3, 120, 1),
(15, 'Generador de Variaciones de Copy', 'Genera variaciones de copy para pruebas A/B:\nElemento: {element}\nCopy actual: {current_copy}\nObjetivo: {goal}\n\nCrea 3 variaciones distintas con diferentes:\n- Titulares\n- Propuestas de valor\n- CTAs\n- Argumentos emocionales vs racionales', 'Variaciones de copy para tests A/B', 'openchat/openchat-7b:free', 250, 72, 2, 95, 1),
(15, 'Narrador de Rol Interactivo', 'Eres un narrador de aventuras de texto. El jugador es {character_name}, un {character_class} en el mundo de {setting}.\n\nSituación actual:\n{situation}\n\nNarra las consecuencias de la acción del jugador: {player_action}\n\nMantén el tono {tone} y ofrece al menos 3 opciones para la siguiente acción.', 'Aventuras de texto interactivas y creativas', 'meta-llama/llama-3.2-3b-instruct:free', 150, 95, 4, 200, 1),
(16, 'Diseñador de Esquemas de Base de Datos en Texto', 'Diseña el esquema de base de datos para:\nAplicación: {app_type}\nFuncionalidades clave: {features}\nEscala esperada: {scale}\n\nDescribe en texto:\n- Tablas y sus propósitos\n- Relaciones entre tablas\n- Campos importantes con tipos de dato\n- Índices recomendados\n- Justificación de decisiones de diseño', 'Diseña esquemas de BD descritos en lenguaje natural', 'microsoft/phi-3-mini-128k-instruct:free', 400, 90, 4, 75, 1),
(16, 'Coach de Productividad Personal', 'Actúa como un coach de productividad. El usuario tiene el siguiente contexto:\nObjetivos: {goals}\nDesafíos actuales: {challenges}\nRecursos disponibles: {resources}\nTiempo por día: {time_per_day}\n\nCrea un plan de productividad semanal detallado con rutinas, técnicas recomendadas y métricas de seguimiento.', 'Planes de productividad personalizados', 'google/gemma-2-9b-it:free', 350, 85, 3, 130, 1);

-- SEED: PromptTag (relaciones prompt-tag)
INSERT INTO PromptTag (prompt_id, tag_id) VALUES
(1, 1), (1, 3),
(2, 1), (2, 11), (2, 4),
(3, 2), (3, 6),
(4, 2), (4, 10),
(5, 8), (5, 9),
(6, 24), (6, 3),
(7, 14), (7, 5),
(8, 1), (8, 18),
(9, 25), (9, 4),
(10, 1), (10, 21),
(11, 24), (11, 13),
(12, 7), (12, 4),
(13, 2), (13, 3),
(14, 19), (14, 22),
(15, 20), (15, 5),
(16, 8), (16, 4),
(17, 12), (17, 15),
(18, 17), (18, 22),
(19, 17), (19, 5),
(20, 10), (20, 4),
(21, 21), (21, 3),
(22, 4), (22, 13),
(23, 23), (23, 16),
(24, 14), (24, 22),
(25, 15), (25, 22);

-- SEED: UserTagFollow (usuarios siguen tags)
INSERT INTO UserTagFollow (user_id, tag_id) VALUES
(2, 1), (2, 2), (2, 3),
(3, 6), (3, 7), (3, 4),
(4, 1), (4, 10), (4, 11),
(5, 2), (5, 5), (5, 14),
(6, 1), (6, 8), (6, 10),
(7, 2), (7, 21),
(8, 1), (8, 24),
(9, 14), (9, 5),
(10, 1), (10, 3), (10, 22),
(11, 1), (11, 17),
(12, 1), (12, 2),
(13, 3), (13, 22), (13, 14),
(14, 4), (14, 13),
(15, 10), (15, 20),
(16, 12), (16, 22),
(17, 1), (17, 22),
(18, 5), (18, 13),
(19, 3), (19, 17),
(20, 10), (20, 4),
(21, 20), (21, 14),
(22, 24), (22, 16),
(23, 1), (23, 2),
(24, 4), (24, 12),
(25, 1), (25, 17);

-- SEED: PromptResponse (respuestas de ejemplo — solo texto)
INSERT INTO PromptResponse (prompt_id, content, tokens_prompt, tokens_response) VALUES
(1, 'Revisión de código completada. Se encontraron 3 problemas principales: primero, la función principal carece de validación de entradas, lo que puede causar errores silenciosos; segundo, se detectó concatenación directa de strings en una consulta SQL, exponiendo la aplicación a inyección; tercero, los nombres de variables como "x" y "tmp" dificultan la lectura. Se recomienda agregar tipado estático, implementar un logger estructurado y cubrir los flujos alternativos con pruebas unitarias.', 210, 180),
(2, 'Artículo generado con éxito. Título: "10 Estrategias de SEO para 2025 que Realmente Funcionan". El artículo incluye introducción que contextualiza el tema, seis secciones con subtítulos H2 y tres subsecciones H3 cada una, ejemplos de casos de uso reales, una sección de errores comunes a evitar, y un llamado a la acción final invitando al lector a suscribirse al newsletter. Palabras totales: 1.420. Densidad de keyword principal: 1,8%.', 195, 310),
(3, 'Resumen ejecutivo completado. El documento analiza la expansión de mercado hacia tres regiones de América Latina durante el primer semestre. Los puntos clave son: crecimiento del 34% en México, necesidad de ajuste regulatorio en Brasil y oportunidad de entrada en Colombia con bajo costo de adquisición. El principal elemento de acción es asignar un equipo local en São Paulo antes del Q3. El riesgo más relevante identificado es la volatilidad cambiaria en Argentina.', 280, 240),
(4, 'Correo de marketing generado. Asunto: "Última oportunidad: tu flujo de trabajo cambia hoy". El cuerpo inicia con una pregunta que interpela directamente al lector sobre su mayor problema diario, seguida por la propuesta de valor del producto en dos oraciones claras. El CTA es "Empieza gratis en 60 segundos" con enlace destacado. La posdata indica que la oferta de onboarding gratuito expira en 48 horas. Tono conversacional y directo.', 175, 220),
(5, 'Respuesta de soporte generada. El agente reconoce la frustración del cliente por el cobro duplicado, ofrece disculpas sinceras y explica el proceso de reembolso paso a paso: verificación en 24 horas, notificación por correo y acreditación en 5 días hábiles. Se incluye un número de caso para seguimiento y una oferta de descuento del 10% en la próxima compra como compensación. Tono empático y profesional durante toda la respuesta.', 150, 190),
(6, 'Preguntas de entrevista generadas para el puesto de Product Manager Senior. Se incluyeron 5 preguntas conductuales usando el método STAR, tales como describir una situación en que debió priorizar con información incompleta. Se agregaron 4 preguntas técnicas sobre métricas de producto y frameworks de priorización, y 3 escenarios de resolución de problemas que simulan situaciones reales de conflicto entre equipos. También se añadió una pregunta de ajuste cultural sobre gestión del fracaso.', 130, 185),
(7, 'Análisis de datos completado. El conjunto de datos de 1.200 registros muestra una media de ventas de 4.320 unidades mensuales con una desviación estándar de 890. Se identificó un patrón claro de estacionalidad con picos en noviembre y marzo. La anomalía más notable es una caída del 62% en ventas durante la semana del 14 de julio, consistente con el cierre temporal reportado en el registro de operaciones. Se recomienda excluir esa semana del modelo predictivo.', 300, 390),
(8, 'Resumen legal completado. El contrato de prestación de servicios entre las partes estipula una vigencia de 12 meses renovables automáticamente. Los términos más relevantes incluyen una cláusula de exclusividad en el territorio nacional, penalización del 15% sobre el valor del contrato por terminación anticipada sin causa justificada, y obligación de confidencialidad por 3 años posteriores a la vigencia. Se identificó una cláusula de arbitraje que limita la jurisdicción a la ciudad de Madrid, lo cual puede ser desventajoso para la parte contratante.', 260, 255),
(9, 'Post de blog generado. Título: "Por qué tu estrategia de contenidos está fallando (y cómo arreglarlo hoy)". El post abre con una anécdota cercana al lector, desarrolla tres causas comunes del fracaso en contenidos con ejemplos reales, propone un framework de cinco pasos para reorientar la estrategia y cierra con la pregunta: ¿cuál de estos errores reconoces en tu negocio? Extensión total: 980 palabras. Tono directo y empático.', 200, 410),
(10, 'Documentación de API generada para el endpoint POST /api/v2/orders. La descripción explica el propósito de creación de pedidos. Los parámetros requeridos son customer_id (entero), items (arreglo de objetos con product_id y quantity) y shipping_address (cadena). La autenticación es mediante Bearer token en el header Authorization. Se detallaron los códigos de respuesta 201 (creado), 400 (datos inválidos), 401 (no autorizado) y 500 (error del servidor), con descripción en texto de cada uno y ejemplo del cuerpo de respuesta esperado.', 220, 285),
(11, 'Esquema de paper creado para el tema "Impacto del aprendizaje automático en el diagnóstico temprano de enfermedades cardiovasculares". Abstract resume el problema, metodología propuesta y hallazgos esperados en 150 palabras. La revisión de literatura cubre 4 subtemas: modelos existentes, datasets disponibles, limitaciones actuales y brechas de investigación. La metodología propone un diseño experimental con validación cruzada. Los hallazgos anticipados incluyen comparación de tres algoritmos. La conclusión integra implicaciones clínicas y líneas futuras.', 190, 265),
(12, 'Traducción completada del inglés al español con adaptación cultural. El texto original usaba el modismo "bite the bullet" que fue adaptado como "apretar los dientes y seguir adelante" para mantener el tono coloquial en el contexto de un artículo de superación personal. Las referencias a medidas imperiales fueron convertidas a sistema métrico. El nivel de formalidad se ajustó de "you" informal americano a un "tú" apropiado para audiencia latinoamericana joven. Extensión traducida: 850 palabras.', 120, 155),
(13, 'Guía de migración de Python a TypeScript completada. Se describieron las equivalencias entre listas de Python y arrays de TypeScript, los decoradores vs. los modificadores de acceso, y el manejo de excepciones en ambos lenguajes. Las trampas más comunes identificadas son la tipificación de None vs. null/undefined y la diferencia en el alcance de variables con let/const vs. la asignación directa de Python. Los pasos de validación incluyen ejecutar el linter de TypeScript y comparar las salidas de ambas versiones con los mismos datos de prueba.', 255, 325),
(14, 'Evaluación de síntomas completada. Los síntomas descritos (fatiga persistente, dolor de cabeza matutino y ligero mareo al ponerse de pie) pueden estar asociados con deshidratación crónica, hipotensión ortostática o déficit de hierro. Se recomienda consultar a un médico si los síntomas persisten más de una semana o si se añaden palpitaciones o pérdida del conocimiento. Recomendaciones generales: aumentar la ingesta de agua a 2 litros diarios, evitar levantarse bruscamente y revisar el historial de análisis de sangre recientes. Nota: esta información no reemplaza la consulta médica.', 148, 205),
(15, 'Reporte financiero generado para el período Q1-Q2 2025. El ratio de liquidez corriente es de 2.3, indicando buena capacidad de pago a corto plazo. El margen neto del 8.4% está por encima del promedio sectorial del 6.1%. La tendencia de ingresos muestra crecimiento del 18% interanual, concentrado en el segmento enterprise. El principal riesgo identificado es la concentración del 42% de los ingresos en tres clientes, lo que genera vulnerabilidad ante la pérdida de cualquiera de ellos. Se recomienda una estrategia de diversificación de cartera para el H2.', 240, 355),
(16, 'Calendario de contenidos generado para Instagram en el nicho de bienestar y salud mental. Los primeros 7 días alternan entre carruseles educativos, historias de testimonio y reels de tips rápidos. Los captions están escritos en tono cercano y motivador, con preguntas al cierre para fomentar comentarios. La semana 2 introduce una serie de "mitos vs. realidades". Los hashtags recomendados se dividen en tres bloques: de alta competencia, de nicho y de marca propia. El calendario incluye dos publicaciones por día: una en feed y una en Stories.', 160, 225),
(17, 'Historia corta generada. Título: "El último tren". En un andén vacío a las 3 AM, Laura encuentra un billete de tren con su nombre y una fecha de hace veinte años. La historia sigue su decisión de abordar el tren y el reencuentro con una versión de sí misma que eligió un camino diferente. El conflicto central explora el arrepentimiento y la identidad. El desenlace es abierto, invitando al lector a decidir si Laura regresó o se quedó en ese otro presente. Extensión: 620 palabras. Género: realismo mágico.', 190, 260),
(18, 'Ruta de aprendizaje generada para programación en Rust desde nivel principiante. El plan está estructurado en 6 meses con 8 horas semanales de dedicación. El primer mes cubre sintaxis básica y manejo de memoria. El segundo y tercer mes profundizan en el sistema de tipos y la gestión de errores. Los meses 4 y 5 introducen concurrencia y desarrollo de APIs REST. El mes 6 propone un proyecto integrador: construir una CLI funcional. Los recursos recomendados son el libro oficial "The Rust Programming Language", Rustlings y ejercicios en Exercism.', 175, 235),
(19, 'PRD generado para la funcionalidad de notificaciones push. Las historias de usuario incluyen cuatro escenarios: usuario que activa notificaciones, usuario que personaliza preferencias, usuario que recibe alerta en tiempo real y usuario que desactiva notificaciones específicas. Los criterios de aceptación están redactados con el formato "dado/cuando/entonces". Las métricas de éxito son: tasa de opt-in superior al 45%, tasa de apertura de notificaciones mayor al 20% y tiempo de entrega menor a 3 segundos.', 180, 280),
(20, 'Análisis competitivo completado para empresa de software B2B en el sector de gestión de proyectos. El análisis cubre cuatro competidores principales. El competidor A tiene fortaleza en integraciones pero debilidad en experiencia móvil. El competidor B lidera en precio pero carece de soporte en español. Se identificaron tres oportunidades de diferenciación: soporte en idioma local, onboarding guiado en menos de 10 minutos y pricing flexible por número de proyectos activos en lugar de por usuario.', 210, 270),
(21, 'Casos de uso generados para el módulo de autenticación de una aplicación móvil. El caso de uso principal "Inicio de sesión con biometría" incluye las precondiciones de dispositivo con biometría habilitada y sesión expirada, un flujo principal de 6 pasos, dos flujos alternativos para biometría fallida y modo sin conexión, y la postcondición de acceso al dashboard. Las excepciones cubren intentos fallidos repetidos y cierre del sistema operativo durante el proceso.', 170, 220),
(22, 'Resumen del libro "Thinking, Fast and Slow" de Daniel Kahneman generado. La tesis principal distingue entre el Sistema 1 (pensamiento rápido, automático e intuitivo) y el Sistema 2 (pensamiento lento, deliberado y lógico). Los capítulos clave abordan los sesgos cognitivos más comunes como el efecto ancla, la aversión a la pérdida y el sesgo de disponibilidad. Los aprendizajes prácticos incluyen técnicas para identificar cuándo el Sistema 1 nos lleva a decisiones incorrectas. La aplicación más relevante es en el diseño de procesos de toma de decisiones en equipos de trabajo.', 140, 205),
(23, 'Variaciones de copy generadas para el botón de CTA de una landing page de SaaS. Variación A: "Empieza gratis hoy" con enfoque en facilidad y sin fricción. Variación B: "Ver cómo funciona en 2 minutos" con enfoque en curiosidad y bajo compromiso. Variación C: "Únete a 12.000 equipos que ya usan la plataforma" con enfoque en prueba social y FOMO. Cada variación incluye una hipótesis sobre el perfil de usuario al que apela y una propuesta de métrica primaria para medir el éxito de la prueba A/B.', 130, 175),
(24, 'Descripción del esquema de base de datos generada para una plataforma de e-learning. La tabla Users almacena datos del perfil y credenciales con índice en email. La tabla Courses contiene metadatos del curso con índice en instructor_id y categoría. La tabla Enrollments relaciona usuarios con cursos e incluye el campo de progreso como porcentaje. La tabla Lessons pertenece a Courses con ordenamiento por campo position. Se recomienda una tabla separada de UserProgress para evitar actualizaciones frecuentes en Enrollments. Las decisiones de diseño priorizan lectura intensiva sobre escritura.', 200, 265),
(25, 'Plan de productividad semanal generado. El usuario cuenta con 90 minutos diarios y tiene como objetivo lanzar un proyecto paralelo en 3 meses. El plan asigna lunes y miércoles al desarrollo de producto, martes y jueves a la generación de contenido y validación de mercado, y viernes a revisión semanal de métricas y planificación. Las técnicas recomendadas son Pomodoro de 50 minutos para sesiones de enfoque y time-blocking para proteger el tiempo de trabajo profundo. Las métricas de seguimiento son: tareas completadas por semana, horas de trabajo real vs. planificado y avance en hitos del proyecto.', 170, 235);

-- SEED: Vote (25 votos)
INSERT INTO Vote (user_id, prompt_id, vote_type) VALUES
(3, 1, 1), (4, 1, 1), (5, 1, 1), (6, 1, 1), (7, 1, 1),
(2, 2, 1), (4, 2, 1), (6, 2, 1), (8, 2, 1), (10, 2, 1),
(2, 3, 1), (3, 3, 1), (5, 3, 1), (7, 3, 1), (9, 3, 1),
(4, 4, 1), (6, 4, 1), (8, 4, 1), (10, 4, 1), (12, 4, 1),
(5, 5, 1), (7, 5, 1), (9, 5, 1), (11, 5, 1), (13, 5, 1);

-- =====================================================
-- SEED: Comment (25 comentarios)
-- =====================================================
INSERT INTO Comment (user_id, prompt_id, content) VALUES
(2, 1, 'Excelente prompt. La estructura del reporte de revisión es muy clara y me ahorró horas de trabajo en la revisión de PRs.'),
(3, 1, 'Perfecto para equipos que están adoptando estándares de calidad. El nivel de detalle es justo.'),
(4, 2, 'Mi tráfico orgánico subió un 35% en dos meses usando este prompt consistentemente. Muy recomendado.'),
(5, 3, 'El resumen ejecutivo que genera es directo al punto. Lo uso para procesar reportes largos antes de reuniones.'),
(6, 4, 'Las tasas de apertura de mis correos subieron de 18% a 31% desde que empecé a usar este template.'),
(7, 5, 'El guión de soporte es muy empático. Los clientes responden positivamente y la satisfacción mejoró.'),
(8, 6, 'Las preguntas conductuales siguen el método STAR perfectamente. Muy útil para entrevistas técnicas.'),
(9, 7, 'El análisis en texto plano es comprensible incluso para perfiles no técnicos. Ideal para presentaciones.'),
(10, 8, 'Me ahorró leer 40 páginas de contrato. Identifica exactamente lo que necesito revisar con mi abogado.'),
(11, 9, 'Los posts generados tienen un tono muy natural. No parecen escritos por IA, lo que es difícil de lograr.'),
(12, 10, 'La documentación que genera es clara y cubre los casos edge. Solo tuve que ajustar los ejemplos de respuesta.'),
(13, 11, 'Perfecto para tesis de maestría. El esquema que generó para mi investigación sobre NLP fue sólido y bien fundamentado.'),
(14, 12, 'La adaptación cultural es lo que lo diferencia. No solo traduce, sino que localiza el mensaje correctamente.'),
(15, 13, 'La guía de migración de Python a TypeScript fue muy detallada. Evitó varios errores que habría cometido solo.'),
(16, 14, 'Me gusta que siempre incluye la advertencia médica. Es responsable y genera confianza en el usuario.'),
(17, 15, 'El análisis de ratios explicado en lenguaje simple fue justo lo que necesitaba para mi presentación a inversores.'),
(18, 16, 'El calendario de contenidos viene listo para copiar y pegar. Los captions son de muy buena calidad.'),
(19, 17, 'La historia corta que generó superó mis expectativas. El desenlace abierto es un detalle literario muy bien logrado.'),
(20, 18, 'La ruta de aprendizaje de Rust es muy práctica. Los recursos recomendados son exactamente los correctos.'),
(21, 19, 'El PRD generado fue aprobado por el equipo sin cambios mayores. Ahorra mucho tiempo de redacción.'),
(22, 20, 'El análisis competitivo identificó un ángulo de diferenciación que no habíamos considerado. Muy valioso.'),
(23, 21, 'Los casos de uso están muy bien estructurados. Los usé directamente en Confluence sin modificaciones.'),
(24, 22, 'El resumen de Kahneman captura perfectamente las ideas más aplicables. Lo compartí con todo mi equipo.'),
(25, 23, 'Las tres variaciones de CTA tienen enfoques muy diferentes y bien justificados. Excelente para A/B testing.'),
(3, 24, 'La descripción del esquema en texto plano fue útil para comunicar el diseño a perfiles no técnicos del equipo.'),
(4, 25, 'El plan de productividad es realista y específico. Nada de consejos genéricos, todo adaptado a mi contexto.');

-- SEED: Purchase (25 compras)
INSERT INTO Purchase (buyer_user_id, prompt_id, aipoints_spent) VALUES
(2, 3, 200), (2, 4, 300), (2, 16, 350),
(3, 1, 350), (3, 7, 500),
(4, 2, 400), (4, 9, 300),
(5, 8, 450), (5, 11, 400),
(6, 5, 250), (6, 12, 250),
(7, 13, 550), (7, 15, 600),
(8, 6, 200), (8, 18, 350),
(9, 14, 500), (9, 21, 300),
(10, 17, 200), (10, 20, 500),
(11, 19, 450), (11, 23, 250),
(12, 10, 350), (12, 22, 300),
(13, 24, 400), (13, 25, 350);