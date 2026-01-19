# 📊 Section Macro & Sentiment - Documentation

## Vue d'ensemble

La section **Macro & Sentiment** est un module expert pour suivre les indicateurs macro-financiers qui impactent les marchés boursiers en temps réel.

## 🎯 Fonctionnalités Principales

### 1. **Score de Sentiment Global** (0-100)
- **Très Bullish** (70-100) : Conditions favorables pour achats
- **Bullish** (55-69) : Marché positif, prudence recommandée  
- **Neutre** (45-54) : Attendre des signaux plus clairs
- **Bearish** (30-44) : Prudence, envisager protections
- **Très Bearish** (0-29) : Risque élevé, éviter nouvelles positions

**Composantes du Score:**
- VIX (Volatility Index) - Pondération: 60%
- SPY Performance 1 mois - Pondération: 40%

### 2. **Indicateurs Clés Suivis**

| Ticker | Nom | Catégorie | Description |
|--------|-----|-----------|-------------|
| ^TNX | US 10Y Treasury | Taux sans risque | Taux à 10 ans américain - Indicateur clé pour les actions |
| ^VIX | Volatility Index | Sentiment de risque | Indice de la peur - Mesure la volatilité attendue |
| CL=F | Crude Oil | Inflation & Énergie | Prix du pétrole brut - Indicateur d'inflation |
| GC=F | Gold | Valeur refuge | Prix de l'or - Indicateur de stress économique |
| DX-Y.NYB | Dollar Index | Force du Dollar | Force du dollar US face aux devises majeures |
| EURUSD=X | EUR/USD | Forex | Taux de change Euro / Dollar |

### 3. **Analyse de Corrélation**

**SPY vs TNX** - Comprendre l'impact des taux sur le marché:

- **Corrélation > 0.7** : Forte corrélation positive  
  → Les taux montent avec le marché - Économie en croissance

- **Corrélation 0.3 à 0.7** : Corrélation positive modérée  
  → Mouvement conjoint modéré

- **Corrélation -0.3 à 0.3** : Pas de corrélation significative  
  → Les taux et le marché évoluent indépendamment

- **Corrélation -0.7 à -0.3** : Corrélation négative modérée  
  → La hausse des taux pèse légèrement sur les actions

- **Corrélation < -0.7** : Forte corrélation négative  
  → La hausse des taux fait chuter le marché - Stress financier

### 4. **Graphiques Historiques**

Visualisez l'évolution de chaque indicateur sur différentes périodes:
- 1 Mois
- 3 Mois
- 6 Mois  
- 1 An
- 2 Ans

**Statistiques affichées:**
- Valeur actuelle
- Minimum
- Maximum
- Moyenne
- Volatilité (annualisée)

## 🔌 Endpoints API

### GET `/api/macro/indicators`
Récupère tous les indicateurs avec leurs dernières valeurs

**Response:**
```json
{
  "success": true,
  "indicators": [
    {
      "ticker": "^TNX",
      "name": "US 10Y Treasury",
      "category": "Taux sans risque",
      "value": 4.25,
      "change": 0.05,
      "change_pct": 1.19,
      "timestamp": "2025-12-30 10:00:00"
    }
  ],
  "last_update": "2025-12-30T10:00:00"
}
```

### GET `/api/macro/sentiment-score`
Calcule le score de sentiment global du marché

**Response:**
```json
{
  "success": true,
  "score": 72,
  "sentiment": "Très Bullish 🚀",
  "color": "#10B981",
  "recommendation": "Conditions favorables pour les achats",
  "components": {
    "vix": {
      "value": 15.2,
      "score": 78.4
    },
    "spy_1m": {
      "returns": 3.5,
      "score": 57.0
    }
  }
}
```

### GET `/api/macro/correlation/{period}`
Analyse de corrélation SPY vs TNX

**Parameters:**
- `period`: 1mo, 3mo, 6mo, 1y

**Response:**
```json
{
  "success": true,
  "correlation": -0.65,
  "spy_data": [...],
  "tnx_data": [...],
  "spy_performance": 5.2,
  "tnx_performance": 12.5,
  "analysis": {
    "sentiment": "Corrélation négative modérée",
    "interpretation": "La hausse des taux pèse légèrement sur les actions"
  }
}
```

### GET `/api/macro/historical/{ticker}/{period}`
Données historiques d'un indicateur spécifique

**Parameters:**
- `ticker`: ^TNX, ^VIX, CL=F, GC=F, DX-Y.NYB, EURUSD=X
- `period`: 1mo, 3mo, 6mo, 1y, 2y

**Response:**
```json
{
  "success": true,
  "ticker": "^TNX",
  "name": "US 10Y Treasury",
  "data": [
    {
      "date": "2025-01-01",
      "open": 4.20,
      "high": 4.25,
      "low": 4.18,
      "close": 4.23,
      "volume": 0
    }
  ],
  "stats": {
    "current": 4.23,
    "min": 3.85,
    "max": 4.50,
    "average": 4.15,
    "volatility": 12.5
  }
}
```

## 🚀 Utilisation

1. **Accéder à la section:**  
   Cliquez sur "📊 Macro" dans la barre de navigation ou allez sur `/macro`

2. **Consulter le Score de Sentiment:**  
   En haut de la page, visualisez instantanément les conditions du marché

3. **Surveiller les Indicateurs:**  
   Carte individuelle pour chaque indicateur avec variation quotidienne

4. **Analyser les Corrélations:**  
   Graphique comparatif SPY vs TNX sur période configurable  

5. **Explorer l'Historique:**  
   Sélectionnez un indicateur et une période pour analyser les tendances

## ⚡ Optimisations

- **Cache de 5 minutes** sur toutes les données pour éviter le rate-limiting
- **Données mises à jour** toutes les 5 minutes automatiquement
- **yfinance** utilisé pour fiabilité et gratuité
- **Charts interactifs** avec Chart.js

## 📌 Notes Importantes

- Les données sont en temps réel pendant les heures de marché
- Pour les actifs fermés (weekend/jours fériés), dernières données disponibles
- VIX normal: 12-20, panique: >30
- Taux 10 ans historique moyen: 3-5%

## 🔮 Évolutions Futures

- [ ] Alertes personnalisées sur seuils
- [ ] Plus d'indicateurs (CPI, NFP, Fed Funds Rate)
- [ ] Notifications push pour événements majeurs
- [ ] Analyse technique avancée
- [ ] Corrélations multiples (matrice)

---

**Développé avec ❤️ pour TradeSense AI Platform**
