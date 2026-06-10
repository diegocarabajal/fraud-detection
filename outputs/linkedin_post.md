# POST DE LINKEDIN — Detección de Fraude (versión final)
# ============================================================

Un modelo con 99.83% de accuracy que no detecta ni un solo fraude.
Suena absurdo, pero es exactamente el resultado si aplicás recetas genéricas de Machine Learning a problemas reales de negocio.

Como parte de mi segundo año en la Maestría en Ciencia de Datos (Universidad Austral), me propuse construir un pipeline end-to-end de detección de fraude en transacciones. El objetivo no fue cumplir un requerimiento académico, sino resolver los desafíos reales que enfrenta la industria fintech actual.

━━━━━━━━━━━━━━━━━━━━━
📊 El escenario: 284.807 transacciones reales. Fraudes: solo el 0.17%.
━━━━━━━━━━━━━━━━━━━━━

En entornos con desbalance extremo y alta transaccionalidad, las métricas tradicionales mienten. Diseñar un sistema de prevención de fraude requiere entender que el costo de los errores es profundamente asimétrico.

Lo que implementé en este proyecto:

🔹 Feature Engineering con Criterio de Producción: Construcción de 40+ variables combinando lógica de negocio y comportamiento anómalo: métricas de velocidad transaccional (ventanas de 1h y 6h para ataques de volumen), detección de patrones nocturnos mediante encodings circulares y z-scores de desviación sobre el perfil del usuario.

🔹 Auditoría Estricta de Modelos (Canary Features): Para garantizar que el modelo no memorice ruido, inyecté variables aleatorias "canario". Esto permitió validar mediante Permutation Importance que la señal del set de datos era robusta, blindando el pipeline contra el data leakage antes del entrenamiento.

🔹 Optimización del Umbral Económico: En producción, el umbral de decisión jamás es 0.5. Modele una función de pérdida que pondera el costo de un Falso Negativo (fraude perdido ≈ $122) frente al impacto de un Falso Positivo (falsa alarma / fricción al usuario ≈ $5). El modelo campeón (LightGBM) maximiza el ahorro financiero real, no solo el F1-Score técnico.

🔹 Explicabilidad (SHAP) como Requisito Regulatorio: En la industria financiera y de pagos electrónicos, "el modelo lo dijo" no es una respuesta válida. Utilicé SHAP a nivel global e individual, asegurando la transparencia necesaria para auditorías y cumplimiento normativo.

💻 Para cerrar el círculo, integré un Dashboard interactivo en React que permite a los equipos de Operaciones simular el impacto financiero del modelo en tiempo real según se mueva el umbral de decisión.

Puse el foco en simular los dolores reales de un entorno productivo: monitoreo de data drift, ventanas temporales eficientes y el trade-off entre latencia y capacidad predictiva.

Dejo el repositorio completo con el EDA, los asserts de data leakage y la comparación de arquitecturas en los comentarios.

Me interesa mucho conectar con profesionales que estén trabajando en prevención de fraude, mitigación de riesgos en e-commerce y estructuras de datos a gran escala. ¡Los leo!

#MachineLearning #DataScience #FraudPrevention #Fintech #FeatureEngineering #DataAnalytics #Python


# ============================================================
# PRIMER COMENTARIO (publicalo inmediatamente después del post):
# ============================================================

Repo completo acá: [link a tu repo de GitHub]
Dashboard interactivo: [link a Vercel]

El proyecto incluye: EDA, feature engineering (40+ features con lógica de negocio), auditoría de data leakage con asserts en runtime, canary features, comparación de 4 modelos (LR → RF → XGBoost → LightGBM), análisis de umbral económico óptimo, SHAP global e individual, y cuantificación del impacto en USD.

Si te interesa el tema o tenés feedback técnico, escribime.


# ============================================================
# ESTRATEGIA DE PUBLICACIÓN
# ============================================================

# TIMING: martes o miércoles, 8-10hs Argentina.

# IMAGEN / ADJUNTO: subí el carousel_fraud_v2.pdf como DOCUMENTO
# (no como imagen). LinkedIn lo convierte automáticamente en carousel
# deslizable con navegación por slides.

# PRIMER COMENTARIO: postealo en los primeros 2 minutos después de publicar.
# LinkedIn reduce el alcance a posts con links externos en el cuerpo —
# por eso el repo va siempre en el primer comentario, nunca en el post.

# RESPONDÉ TODO: los primeros 60 minutos son clave para el algoritmo.
# Respondé cada comentario con una pregunta de vuelta para mantener
# la conversación activa.

# HASHTAGS: los que están en el post ya están optimizados para el
# ecosistema fintech/DS latinoamericano. No agregues más de 8-10.
