"""
Macro & Sentiment Module
Expert-level module for tracking macro-financial indicators that impact stock markets
"""

from flask import Blueprint, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from functools import lru_cache
import time

macro_sentiment_bp = Blueprint('macro_sentiment', __name__)

# Configuration des indicateurs macro
MACRO_INDICATORS = {
    '^TNX': {
        'name': 'US 10Y Treasury',
        'category': 'Taux sans risque',
        'description': 'Taux à 10 ans américain - Indicateur clé pour les actions',
        'unit': '%'
    },
    '^VIX': {
        'name': 'Volatility Index',
        'category': 'Sentiment de risque',
        'description': 'Indice de la peur - Mesure la volatilité attendue',
        'unit': ''
    },
    'CL=F': {
        'name': 'Crude Oil',
        'category': 'Inflation & Énergie',
        'description': 'Prix du pétrole brut - Indicateur d\'inflation',
        'unit': '$'
    },
    'GC=F': {
        'name': 'Gold',
        'category': 'Valeur refuge',
        'description': 'Prix de l\'or - Indicateur de stress économique',
        'unit': '$'
    },
    'DX-Y.NYB': {
        'name': 'Dollar Index',
        'category': 'Force du Dollar',
        'description': 'Force du dollar US face aux devises majeures',
        'unit': ''
    },
    'EURUSD=X': {
        'name': 'EUR/USD',
        'category': 'Forex',
        'description': 'Taux de change Euro / Dollar',
        'unit': ''
    }
}

# Cache simple avec expiration (5 minutes)
_cache = {}
_cache_expiry = {}
CACHE_DURATION = 300  # 5 minutes

def get_cached_data(key):
    """Récupère les données du cache si elles sont encore valides"""
    if key in _cache and key in _cache_expiry:
        if time.time() < _cache_expiry[key]:
            return _cache[key]
    return None

def set_cached_data(key, data):
    """Met en cache les données avec expiration"""
    _cache[key] = data
    _cache_expiry[key] = time.time() + CACHE_DURATION

@macro_sentiment_bp.route('/api/macro/indicators', methods=['GET'])
def get_macro_indicators():
    """
    Récupère les dernières valeurs de tous les indicateurs macro
    Returns: Dashboard avec prix actuel, variation %, variation absolue
    """
    cache_key = 'macro_indicators'
    cached = get_cached_data(cache_key)
    if cached:
        return jsonify(cached)
    
    try:
        indicators_data = []
        
        for ticker, info in MACRO_INDICATORS.items():
            try:
                # Télécharger les 5 derniers jours pour avoir une valeur fiable
                data = yf.download(ticker, period='5d', interval='1d', progress=False)
                
                if data.empty:
                    continue
                
                # Dernière valeur
                last_price = float(data['Close'].iloc[-1])
                
                # Variation par rapport à la veille
                if len(data) >= 2:
                    prev_price = float(data['Close'].iloc[-2])
                    change = last_price - prev_price
                    change_pct = (change / prev_price) * 100
                else:
                    change = 0
                    change_pct = 0
                
                indicators_data.append({
                    'ticker': ticker,
                    'name': info['name'],
                    'category': info['category'],
                    'description': info['description'],
                    'unit': info['unit'],
                    'value': round(last_price, 2),
                    'change': round(change, 2),
                    'change_pct': round(change_pct, 2),
                    'timestamp': data.index[-1].strftime('%Y-%m-%d %H:%M:%S')
                })
                
            except Exception as e:
                print(f"Erreur pour {ticker}: {str(e)}")
                continue
        
        response = {
            'success': True,
            'indicators': indicators_data,
            'last_update': datetime.now().isoformat()
        }
        
        set_cached_data(cache_key, response)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@macro_sentiment_bp.route('/api/macro/correlation/<period>', methods=['GET'])
def get_correlation_analysis(period='6mo'):
    """
    Analyse de corrélation SPY vs TNX
    Period: 1mo, 3mo, 6mo, 1y
    """
    cache_key = f'correlation_{period}'
    cached = get_cached_data(cache_key)
    if cached:
        return jsonify(cached)
    
    try:
        # Télécharger SPY (S&P500) et TNX (Taux 10 ans)
        spy_data = yf.download('SPY', period=period, interval='1d', progress=False)
        tnx_data = yf.download('^TNX', period=period, interval='1d', progress=False)
        
        if spy_data.empty or tnx_data.empty:
            return jsonify({
                'success': False,
                'error': 'Données non disponibles'
            }), 404
        
        # Normaliser les données pour comparer les performances (base 100)
        spy_normalized = (spy_data['Close'] / spy_data['Close'].iloc[0]) * 100
        tnx_normalized = (tnx_data['Close'] / tnx_data['Close'].iloc[0]) * 100
        
        # Calculer la corrélation
        merged = pd.DataFrame({
            'SPY': spy_data['Close'],
            'TNX': tnx_data['Close']
        }).dropna()
        
        correlation = merged['SPY'].corr(merged['TNX'])
        
        # Préparer les données pour le graphique
        spy_chart_data = []
        tnx_chart_data = []
        
        for date, value in spy_normalized.items():
            spy_chart_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'value': round(float(value), 2)
            })
        
        for date, value in tnx_normalized.items():
            tnx_chart_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'value': round(float(value), 2)
            })
        
        # Performance totale
        spy_performance = round(float((spy_data['Close'].iloc[-1] / spy_data['Close'].iloc[0] - 1) * 100), 2)
        tnx_performance = round(float((tnx_data['Close'].iloc[-1] / tnx_data['Close'].iloc[0] - 1) * 100), 2)
        
        response = {
            'success': True,
            'correlation': round(float(correlation), 3),
            'spy_data': spy_chart_data,
            'tnx_data': tnx_chart_data,
            'spy_performance': spy_performance,
            'tnx_performance': tnx_performance,
            'period': period,
            'analysis': get_correlation_interpretation(correlation, spy_performance, tnx_performance)
        }
        
        set_cached_data(cache_key, response)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_correlation_interpretation(corr, spy_perf, tnx_perf):
    """Interprète la corrélation et donne des insights"""
    if corr > 0.7:
        sentiment = "Forte corrélation positive"
        interpretation = "Les taux montent avec le marché - Économie en croissance"
    elif corr > 0.3:
        sentiment = "Corrélation positive modérée"
        interpretation = "Movement conjoint modéré entre taux et actions"
    elif corr > -0.3:
        sentiment = "Pas de corrélation significative"
        interpretation = "Les taux et le marché évoluent indépendamment"
    elif corr > -0.7:
        sentiment = "Corrélation négative modérée"
        interpretation = "La hausse des taux pèse légèrement sur les actions"
    else:
        sentiment = "Forte corrélation négative"
        interpretation = "La hausse des taux fait chuter le marché - Stress financier"
    
    return {
        'sentiment': sentiment,
        'interpretation': interpretation,
        'message': f"SPY: {spy_perf:+.2f}% | TNX: {tnx_perf:+.2f}% | Corrélation: {corr:.2f}"
    }

@macro_sentiment_bp.route('/api/macro/historical/<ticker>/<period>', methods=['GET'])
def get_historical_data(ticker, period='6mo'):
    """
    Récupère l'historique d'un indicateur spécifique
    Period: 1mo, 3mo, 6mo, 1y, 2y
    """
    cache_key = f'historical_{ticker}_{period}'
    cached = get_cached_data(cache_key)
    if cached:
        return jsonify(cached)
    
    try:
        # Valider le ticker
        if ticker not in MACRO_INDICATORS:
            return jsonify({
                'success': False,
                'error': 'Ticker invalide'
            }), 400
        
        # Télécharger les données historiques
        data = yf.download(ticker, period=period, interval='1d', progress=False)
        
        if data.empty:
            return jsonify({
                'success': False,
                'error': 'Données non disponibles'
            }), 404
        
        # Préparer les données pour le graphique
        chart_data = []
        for date, row in data.iterrows():
            chart_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': round(float(row['Open']), 2),
                'high': round(float(row['High']), 2),
                'low': round(float(row['Low']), 2),
                'close': round(float(row['Close']), 2),
                'volume': int(row['Volume']) if 'Volume' in row and not pd.isna(row['Volume']) else 0
            })
        
        # Statistiques
        current_value = float(data['Close'].iloc[-1])
        min_value = float(data['Close'].min())
        max_value = float(data['Close'].max())
        avg_value = float(data['Close'].mean())
        volatility = float(data['Close'].pct_change().std() * np.sqrt(252) * 100)  # Annualisée
        
        response = {
            'success': True,
            'ticker': ticker,
            'name': MACRO_INDICATORS[ticker]['name'],
            'data': chart_data,
            'stats': {
                'current': round(current_value, 2),
                'min': round(min_value, 2),
                'max': round(max_value, 2),
                'average': round(avg_value, 2),
                'volatility': round(volatility, 2)
            },
            'period': period
        }
        
        set_cached_data(cache_key, response)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@macro_sentiment_bp.route('/api/macro/sentiment-score', methods=['GET'])
def get_market_sentiment_score():
    """
    Calcule un score de sentiment global basé sur les indicateurs
    Score: 0-100 (0 = Très Bearish, 50 = Neutre, 100 = Très Bullish)
    """
    cache_key = 'sentiment_score'
    cached = get_cached_data(cache_key)
    if cached:
        return jsonify(cached)
    
    try:
        # Récupérer VIX et autres indicateurs
        vix = yf.download('^VIX', period='5d', interval='1d', progress=False)
        spy = yf.download('SPY', period='1mo', interval='1d', progress=False)
        
        if vix.empty or spy.empty:
            return jsonify({
                'success': False,
                'error': 'Données insuffisantes'
            }), 404
        
        # Calcul du score
        vix_value = float(vix['Close'].iloc[-1])
        spy_returns = float((spy['Close'].iloc[-1] / spy['Close'].iloc[0] - 1) * 100)
        
        # Score VIX (inversé: VIX bas = bullish)
        # VIX normal: 12-20, panique: >30
        vix_score = max(0, min(100, 100 - (vix_value - 12) * 3))
        
        # Score S&P500 (performance mensuelle)
        spy_score = max(0, min(100, 50 + spy_returns * 2))
        
        # Score global (moyenne pondérée)
        global_score = int(vix_score * 0.6 + spy_score * 0.4)
        
        # Interprétation
        if global_score >= 70:
            sentiment = "Très Bullish 🚀"
            color = "#FF8C00"
            recommendation = "Conditions favorables pour les achats"
        elif global_score >= 55:
            sentiment = "Bullish 📈"
            color = "#FFAA00"
            recommendation = "Marché positif, prudence recommandée"
        elif global_score >= 45:
            sentiment = "Neutre ⚖️"
            color = "#FFB84D"
            recommendation = "Attendre des signaux plus clairs"
        elif global_score >= 30:
            sentiment = "Bearish 📉"
            color = "#FF9500"
            recommendation = "Prudence, envisager des protections"
        else:
            sentiment = "Très Bearish 💔"
            color = "#FF7A00"
            recommendation = "Risque élevé, éviter les nouvelles positions"
        
        response = {
            'success': True,
            'score': global_score,
            'sentiment': sentiment,
            'color': color,
            'recommendation': recommendation,
            'components': {
                'vix': {
                    'value': round(vix_value, 2),
                    'score': round(vix_score, 1)
                },
                'spy_1m': {
                    'returns': round(spy_returns, 2),
                    'score': round(spy_score, 1)
                }
            },
            'timestamp': datetime.now().isoformat()
        }
        
        set_cached_data(cache_key, response)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
