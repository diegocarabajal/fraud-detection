# 🔍 Detección de Fraude en Transacciones — End-to-End Pipeline

### Machine Learning · Feature Engineering · Explicabilidad · Impacto de Negocio

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![LightGBM](https://img.shields.io/badge/LightGBM-4.0+-1B6CA8?style=flat)
![XGBoost](https://img.shields.io/badge/XGBoost-1.7+-FF6600?style=flat)
![SHAP](https://img.shields.io/badge/SHAP-Explicabilidad-00C896?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## 📌 Contexto del problema

Según el **Nilson Report (enero 2026)**, las pérdidas globales por fraude con tarjetas de pago alcanzaron **USD 33.410 millones en 2024** — 6,43 centavos por cada USD 100 transaccionados a nivel mundial. En Argentina, el **informe del BCRA 2025** registró 769.500 reclamos mensuales promedio en el sistema financiero, con los principales conceptos vinculados a desconocimiento de compras con tarjeta y operaciones fraudulentas en canales electrónicos, sobre un sistema que ya alcanza **140,5 millones de usuarios** entre bancos, billeteras digitales y emisoras de tarjetas.

Los equipos de Prevención de Fraude de estas plataformas operan con modelos de ML que procesan miles de variables en milisegundos para decidir si aprobar o bloquear una transacción. El desafío técnico no es solo construir un buen modelo, sino integrarlo en un pipeline que permita:

- **Iterar rápido** (time-to-market de nuevos features y modelos)
- **Monitorear KPIs en tiempo real** (detectar ataques incipientes antes de que escalen)
- **Explicar decisiones** (requisito regulatorio y de experiencia del usuario)
- **Cuantificar el trade-off** entre aprobación de transacciones legítimas y detección de fraude

Este proyecto simula ese contexto end-to-end.

---

## 🎯 ¿Qué demuestra este proyecto?

| Competencia | Cómo se demuestra |
|-------------|-------------------|
| **Feature engineering con criterio de negocio** | 40+ features construidas sobre patrones reales de fraude (velocidad de transacciones, anomalías estadísticas, encoding temporal, interacciones PCA) |
| **Auditoría de data leakage** | Pipeline con split-first, fit-on-train, verificación formal con asserts |
| **Canary features** | Validación de que las features engineered aportan señal real y no son ruido |
| **Selección rigurosa de modelos** | 4 modelos comparados con justificación técnica; LightGBM como campeón (leaf-wise > level-wise en fraude) |
| **Métricas correctas para desbalance** | PR-AUC y Recall como métricas principales; análisis del por qué accuracy engaña |
| **Optimización de umbral de decisión** | Umbral económico óptimo basado en costo asimétrico de FP vs FN |
| **Monitoreo de KPIs** | Simulación de dashboard con métricas de producción (approval rate, fraud rate, precision drift) |
| **Explicabilidad (SHAP)** | Global (beeswarm) e individual (waterfall): auditable y comunicable a stakeholders no técnicos |
| **Impacto económico cuantificable** | Traducción de métricas técnicas a ahorro estimado en USD |

---

## 📁 Estructura del Proyecto

```
fraud-detection/
│
├── data/
│   └── creditcard.csv                   ← Dataset de Kaggle (no incluido, ver instrucciones)
│
├── notebooks/
│   └── fraud_detection.ipynb            ← Pipeline completo: EDA → FE → Modelos → SHAP
│
├── outputs/                             ← Gráficos generados por el notebook
│   ├── 01_class_distribution.png
│   ├── 02_amount_time_analysis.png
│   ├── 03_discriminative_features.png
│   ├── 04_engineered_features.png
│   ├── 05_roc_pr_curves.png
│   ├── 06_confusion_threshold.png
│   ├── 07_feature_importance_canary.png
│   ├── 08_canary_distribution.png
│   ├── 09_shap_beeswarm.png
│   ├── 10_shap_waterfall.png
│   ├── 11_economic_impact.png
│   └── carousel_fraud_v2.pdf            ← Carousel de LinkedIn (10 slides)
│
├── dashboard/
│   └── fraud_dashboard.jsx              ← Dashboard interactivo en React
│
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🖥️ Dashboard Interactivo (Simulador de Impacto en Vivo)

Para conectar la matemática del modelo con las decisiones financieras del negocio, encapsulé el pipeline en una interfaz interactiva de React. El dashboard funciona como un **simulador operativo en tiempo real** donde los equipos de Risk u Operaciones pueden mover el umbral de decisión y visualizar de inmediato el trade-off financiero ($122 por Falso Negativo vs. $5 por Falso Positivo).

👉 **[Acceder al Dashboard Interactivo (Claude Artifact) 🚀](https://claude.ai/public/artifacts/dbcb9006-d557-4483-ba05-c2f4ecbbd028)**

*(Ejecuta directamente en el navegador, sin necesidad de instalaciones ni configuraciones locales).*

---

## 🔬 Dataset

**Credit Card Fraud Detection** — [Kaggle](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud)

| Característica | Detalle |
|---|---|
| Transacciones totales | 284,807 |
| Fraudulentas | 492 (0.172%) |
| Features | 30 (V1–V28 PCA + Time + Amount) |
| Desbalance | 1 : 578 |
| Origen | Transacciones reales de tarjetas europeas, anonimizadas |

---

## ⚙️ Pipeline

```
    ┌──────────────────────────────────────────────────────────┐
    │                    EDA (dataset completo)                │
    │   Distribución de clases · Análisis temporal · Effect    │
    │   size de features PCA                                   │
    └──────────────────────────────┬───────────────────────────┘
                                   │
    ┌──────────────────────────────▼───────────────────────────┐
    │          FEATURE ENGINEERING — DETERMINÍSTICO            │
    │   (sin estadísticas del dataset → sin riesgo de leakage) │
    │   Temporales · Monto · Velocidad · Interacciones PCA     │
    └──────────────────────────────┬───────────────────────────┘
                                   │
    ┌──────────────────────────────▼──────────────────────────┐
    │              SPLIT ESTRATIFICADO (80/20)                │
    │            TODO lo que sigue es post-split              |
    └─────────────┬───────────────────────────────┬───────────┘
                  │                               │
    ┌─────────────▼──────────────┐  ┌─────────────▼──────────────┐
    │     TRAIN (fit)            │  │     TEST (transform only)  │
    │  Fit estadísticas          │  │  Apply con params de train │
    │  Fit scaler                │  │  Transform con scaler      │
    │  SMOTE                     │  │  Sin tocar                 │
    │  + Canary features         │  │  + Canary features (seed≠) │
    └─────────────┬──────────────┘  └─────────────┬──────────────┘
                  │                               │
    ┌─────────────▼───────────────────────────────▼────────────┐
    │                  ENTRENAMIENTO                           │
    │   LR (baseline) → RF → XGBoost → LightGBM (campeón)      │
    └──────────────────────────────┬───────────────────────────┘
                                   │
    ┌──────────────────────────────▼───────────────────────────┐
    │              EVALUACIÓN + CANARY ANALYSIS                │
    │   PR-AUC · Recall · Threshold sweep · Feature importance │
    │   3 perspectivas + umbral canario                        │
    └──────────────────────────────┬───────────────────────────┘
                                   │
    ┌──────────────────────────────▼───────────────────────────┐
    │              SHAP + IMPACTO ECONÓMICO                    │
    │   Explicabilidad global/individual · Ahorro estimado     │
    └──────────────────────────────────────────────────────────┘
```

---

## 🧠 Feature Engineering

40+ features construidas con lógica de negocio, no solo transformaciones matemáticas genéricas:

| Categoría | Features | Patrón de fraude que captura |
|-----------|----------|------------------------------|
| **Temporales** | `hour_sin`, `hour_cos`, `is_night` | Fraude concentrado en horarios de bajo tráfico |
| **Monto** | `log_amount`, `amount_rounded`, `is_micro_txn` | Card testing con micro-transacciones; montos exactos |
| **Velocidad** | `txn_count_1h`, `txn_rate_6h` | Ataques de volumen (múltiples intentos en ventana corta) |
| **Anomalía** | `amount_zscore`, `n_anomalous_features` | Transacciones con perfil estadístico atípico |
| **Interacciones** | `V{i}_x_V{j}`, `top_features_norm` | Relaciones no lineales en espacio PCA |

Todas las features estadísticas (z-scores, deciles, ratios) se calculan con **parámetros fit en train** y aplicados por separado en test. **Sin data leakage.**

---

## 🐤 Canary Features — Validación de señal

Se agregan 20 features de ruido puro (uniforme, normal, binario, correlacionado débil) al dataset antes de entrenar. El modelo no debería darles importancia.

**Para qué sirven:**
- Si una feature real tiene menos importancia que el canario más importante → no aporta señal genuina
- Si el feature engineering está bien hecho, todas las features reales deberían superar el umbral canario
- Tres métodos de importancia evaluados (Gain, Split, Permutation) para evitar sesgos de un solo método

---

## 📊 Resultados

| Modelo | ROC-AUC | PR-AUC ⭐ | Recall | Precision | F1 |
|--------|---------|-----------|--------|-----------|-----|
| Logistic Regression | 0.9763 | 0.7652 | 0.9082 | 0.0488 | 0.0926 |
| Random Forest | 0.9761 | 0.8059 | 0.8469 | 0.6917 | 0.7615 |
| XGBoost | 0.9769 | 0.8644 | 0.8571 | 0.8571 | 0.8571 |
| **LightGBM** | **0.9660** | **0.8738** | **0.8673** | **0.8173** | **0.8416** |

> Valores obtenidos con umbral de decisión 0.50. Umbral óptimo (máx F1): **0.92** → Recall=0.8571, Precision=0.8750.

### ¿Por qué LightGBM sobre XGBoost?

- **Leaf-wise vs level-wise**: LightGBM reduce el error más rápido por iteración en patrones raros (como fraude)
- **`is_unbalance=True`**: ajusta pesos dinámicamente durante el boosting, más flexible que `scale_pos_weight` estático
- **Early stopping**: mejor iteración alcanzada en ronda 944 de 1000

---

## 🛡️ Auditoría de Data Leakage

5 fuentes de leakage identificadas y corregidas:

| # | Feature | Leakage | Corrección |
|---|---------|---------|------------|
| 1 | Todas | Scaler fit sobre dataset completo | Fit solo en train |
| 2 | `amount_zscore` | Media/std incluían test | Parámetros de train en `fit_statistical_features()` |
| 3 | `n_anomalous_features` | Z-scores PCA sobre todo el dataset | Estadísticas fit en train |
| 4 | `amount_decile` | `pd.qcut()` sobre todo el dataset | `KBinsDiscretizer` fit en train |
| 5 | `amount_vs_window_ratio` | Ratio con media global | Media solo de train |

El notebook incluye **asserts en tiempo de ejecución** que verifican la ausencia de leakage antes de entrenar.

---

## 💡 SHAP — Explicabilidad

En el ecosistema financiero, un modelo de caja negra no es suficiente. SHAP permite:

- Auditar por qué se bloqueó una transacción específica (requisito regulatorio BCRA / Basilea IV)
- Comunicar el razonamiento a equipos de negocio y compliance
- Demostrar que el modelo no discrimina por variables protegidas

---

## 💰 Impacto Económico

| Escenario | Costo estimado (test set) |
|-----------|--------------------------|
| Sin modelo (pérdida total) | $11,976.71 |
| Con modelo (umbral óptimo 0.05) | $1,564.32 |
| **Ahorro estimado** | **$10,412.38 (86.9%)** |

---

## 🛠️ Instalación

```bash
git clone https://github.com/tu-usuario/fraud-detection.git
cd fraud-detection
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Descargar dataset → https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
# Guardar en data/creditcard.csv

jupyter notebook notebooks/fraud_detection.ipynb
```

---

## 📚 Stack Tecnológico

| Librería | Uso |
|----------|-----|
| `pandas` / `numpy` | Feature engineering y manipulación de datos |
| `scikit-learn` | Modelos baseline, métricas, permutation importance, `KBinsDiscretizer` |
| `lightgbm` | Modelo campeón (leaf-wise gradient boosting) |
| `xgboost` | Comparación (level-wise gradient boosting) |
| `imbalanced-learn` | SMOTE para oversampling de clase minoritaria |
| `shap` | Explicabilidad global e individual |
| `matplotlib` / `seaborn` | Visualizaciones |

---

## 🚀 Origen y Motivación (Desafío Personal)

Este proyecto no nace como una entrega académica obligatoria, sino como un **desafío de ingeniería personal**. 

Estando en el 2° año de la **Maestría en Ciencia de Datos** (Universidad Austral), quise ir más allá de los modelos teóricos de laboratorio. Mi objetivo fue autoevaluarme y diseñar un pipeline *end-to-end* con las restricciones, metodologías y dolores reales que enfrentan los equipos de Data Science y Risk Mitigating en industrias de alta transaccionalidad (Fintech/E-commerce). 

Buscaba responder una pregunta clave: *¿Cómo se defienden, auditan y traducen a impacto financiero las métricas de un modelo cuando operás bajo un desbalance extremo del 0.17%?*

---

## 📬 Contacto

**Diego Carabajal**  
Maestría en Ciencia de Datos · Universidad Austral  
Backend Developer Python @ Gestorando  

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/diego-carabajal/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github)](https://github.com/diegocarabajal)

---

*Si este proyecto te resultó útil o interesante, ¡una ⭐ en el repo es muy bienvenida!*
