"""
Script de Web Scraping - Bourse de Casablanca
==============================================
Ce script extrait toutes les données des actions cotées à la Bourse de Casablanca.

Auteur: Système de Trading TradeOrange
Date: 2026-01-15
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import time
from datetime import datetime
from typing import List, Dict
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CasablancaBourseScaper:
    """
    Classe pour scraper les données de la Bourse de Casablanca
    """
    
    def __init__(self):
        """Initialisation du scraper"""
        self.base_url = "https://www.casablanca-bourse.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
        })
        self.stocks_data = []
    
    def fetch_page(self, url: str, max_retries: int = 3) -> requests.Response:
        """
        Récupère une page avec gestion des erreurs et retry
        
        Args:
            url: URL à récupérer
            max_retries: Nombre maximum de tentatives
            
        Returns:
            Response object
        """
        for attempt in range(max_retries):
            try:
                logger.info(f"Tentative {attempt + 1}/{max_retries} pour {url}")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                # Délai entre les requêtes pour éviter le blocage
                time.sleep(2)
                return response
                
            except requests.RequestException as e:
                logger.warning(f"Erreur lors de la requête: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"Échec après {max_retries} tentatives")
                    raise
                time.sleep(5)
    
    def check_for_api(self) -> bool:
        """
        Vérifie s'il existe une API interne pour les cotations
        
        Returns:
            True si API détectée, False sinon
        """
        logger.info("Vérification de l'existence d'une API interne...")
        
        # URLs API potentielles
        api_urls = [
            f"{self.base_url}/api/data/products",
            f"{self.base_url}/api/cotations",
            f"{self.base_url}/api/stocks",
            f"{self.base_url}/fr/api/cours",
        ]
        
        for api_url in api_urls:
            try:
                response = self.session.get(api_url, timeout=10)
                if response.status_code == 200 and 'application/json' in response.headers.get('Content-Type', ''):
                    logger.info(f"✅ API trouvée: {api_url}")
                    return True
            except:
                continue
        
        logger.info("❌ Pas d'API détectée, utilisation du scraping HTML")
        return False
    
    def scrape_stocks_from_api(self, api_url: str) -> List[Dict]:
        """
        Extrait les données via API si disponible
        
        Args:
            api_url: URL de l'API
            
        Returns:
            Liste des actions avec leurs données
        """
        logger.info("Extraction des données via API...")
        
        try:
            response = self.fetch_page(api_url)
            data = response.json()
            
            stocks = []
            # Adapter selon la structure de l'API
            for item in data.get('stocks', data.get('data', [])):
                stock = {
                    'nom': item.get('name', item.get('nom', 'N/A')),
                    'isin': item.get('isin', 'N/A'),
                    'symbole': item.get('symbol', item.get('ticker', 'N/A')),
                    'dernier_cours': item.get('last', item.get('cours', 0)),
                    'variation_pct': item.get('variation', item.get('var_pct', 0)),
                    'volume': item.get('volume', 0),
                    'capitalisation': item.get('capitalization', item.get('cap', 0)),
                    'date_extraction': datetime.now().isoformat()
                }
                stocks.append(stock)
            
            logger.info(f"✅ {len(stocks)} actions extraites via API")
            return stocks
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction API: {e}")
            return []
    
    def scrape_stocks_from_html(self) -> List[Dict]:
        """
        Extrait les données par scraping HTML
        
        Returns:
            Liste des actions avec leurs données
        """
        logger.info("Extraction des données par scraping HTML...")
        
        # URL de la page des cotations
        cotations_url = f"{self.base_url}/fr/cotations/actions"
        
        try:
            response = self.fetch_page(cotations_url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            stocks = []
            
            # Recherche des tableaux de cotations
            tables = soup.find_all('table', {'class': ['table', 'quotation', 'cours']})
            
            if not tables:
                # Fallback: chercher tous les tableaux
                tables = soup.find_all('table')
                logger.warning(f"Recherche générique: {len(tables)} tableaux trouvés")
            
            for table in tables:
                rows = table.find_all('tr')[1:]  # Skip header
                
                for row in rows:
                    cols = row.find_all(['td', 'th'])
                    
                    if len(cols) >= 4:  # Au minimum nom, cours, variation, volume
                        try:
                            stock = {
                                'nom': cols[0].text.strip(),
                                'symbole': cols[1].text.strip() if len(cols) > 1 else 'N/A',
                                'dernier_cours': self._parse_number(cols[2].text if len(cols) > 2 else '0'),
                                'variation_pct': self._parse_number(cols[3].text if len(cols) > 3 else '0'),
                                'volume': self._parse_number(cols[4].text if len(cols) > 4 else '0'),
                                'capitalisation': self._parse_number(cols[5].text if len(cols) > 5 else '0'),
                                'isin': 'N/A',  # À compléter si disponible
                                'date_extraction': datetime.now().isoformat()
                            }
                            
                            # Vérifier que le nom n'est pas vide
                            if stock['nom'] and stock['nom'] != 'N/A':
                                stocks.append(stock)
                                
                        except Exception as e:
                            logger.warning(f"Erreur lors du parsing d'une ligne: {e}")
                            continue
            
            logger.info(f"✅ {len(stocks)} actions extraites par scraping HTML")
            return stocks
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping HTML: {e}")
            return []
    
    def scrape_individual_stock_detail(self, stock_url: str) -> Dict:
        """
        Extrait les détails d'une action spécifique
        
        Args:
            stock_url: URL de la page de l'action
            
        Returns:
            Dictionnaire avec les détails
        """
        try:
            response = self.fetch_page(stock_url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            details = {}
            
            # Rechercher les informations spécifiques
            # Code ISIN
            isin_elem = soup.find(text=lambda t: t and 'ISIN' in t)
            if isin_elem:
                details['isin'] = isin_elem.find_next().text.strip()
            
            # Capitalisation
            cap_elem = soup.find(text=lambda t: t and 'Capitalisation' in t)
            if cap_elem:
                details['capitalisation'] = self._parse_number(cap_elem.find_next().text)
            
            return details
            
        except Exception as e:
            logger.warning(f"Erreur lors de l'extraction des détails: {e}")
            return {}
    
    def _parse_number(self, text: str) -> float:
        """
        Parse un nombre depuis une chaîne (gère les formats français)
        
        Args:
            text: Texte à parser
            
        Returns:
            Nombre en float
        """
        try:
            # Nettoyer le texte
            text = text.strip().replace(' ', '').replace('\xa0', '')
            text = text.replace(',', '.')  # Format français
            text = ''.join(c for c in text if c.isdigit() or c in ['.', '-'])
            
            return float(text) if text else 0.0
        except:
            return 0.0
    
    def run(self) -> List[Dict]:
        """
        Exécute le scraping complet
        
        Returns:
            Liste des actions extraites
        """
        logger.info("🚀 Démarrage du scraping de la Bourse de Casablanca...")
        
        # Vérifier s'il y a une API
        if self.check_for_api():
            # Tenter l'extraction via API
            self.stocks_data = self.scrape_stocks_from_api(f"{self.base_url}/api/data/products")
        
        # Si pas d'API ou échec, utiliser le scraping HTML
        if not self.stocks_data:
            self.stocks_data = self.scrape_stocks_from_html()
        
        if not self.stocks_data:
            logger.error("❌ Aucune donnée n'a pu être extraite!")
        else:
            logger.info(f"✅ Extraction terminée: {len(self.stocks_data)} actions")
        
        return self.stocks_data
    
    def export_to_csv(self, filename: str = 'bourse_casablanca.csv'):
        """
        Exporte les données en CSV
        
        Args:
            filename: Nom du fichier CSV
        """
        if not self.stocks_data:
            logger.warning("Aucune donnée à exporter")
            return
        
        logger.info(f"Export vers CSV: {filename}")
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                if self.stocks_data:
                    writer = csv.DictWriter(f, fieldnames=self.stocks_data[0].keys())
                    writer.writeheader()
                    writer.writerows(self.stocks_data)
            
            logger.info(f"✅ Export CSV réussi: {filename}")
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'export CSV: {e}")
    
    def export_to_json(self, filename: str = 'bourse_casablanca.json'):
        """
        Exporte les données en JSON
        
        Args:
            filename: Nom du fichier JSON
        """
        if not self.stocks_data:
            logger.warning("Aucune donnée à exporter")
            return
        
        logger.info(f"Export vers JSON: {filename}")
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({
                    'metadata': {
                        'source': 'Bourse de Casablanca',
                        'url': self.base_url,
                        'date_extraction': datetime.now().isoformat(),
                        'nombre_actions': len(self.stocks_data)
                    },
                    'actions': self.stocks_data
                }, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Export JSON réussi: {filename}")
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'export JSON: {e}")
    
    def print_summary(self):
        """Affiche un résumé des données extraites"""
        if not self.stocks_data:
            print("\n❌ Aucune donnée extraite")
            return
        
        print("\n" + "="*60)
        print(f"📊 RÉSUMÉ - Bourse de Casablanca")
        print("="*60)
        print(f"Nombre d'actions extraites: {len(self.stocks_data)}")
        print(f"Date d'extraction: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n📈 Aperçu des premières actions:\n")
        
        for i, stock in enumerate(self.stocks_data[:5], 1):
            print(f"{i}. {stock['nom']} ({stock['symbole']})")
            print(f"   Cours: {stock['dernier_cours']} | Variation: {stock['variation_pct']}%")
            print(f"   Volume: {stock['volume']:,}")
            print()
        
        if len(self.stocks_data) > 5:
            print(f"... et {len(self.stocks_data) - 5} autres actions")
        
        print("="*60 + "\n")


def main():
    """
    Fonction principale pour exécuter le scraper
    """
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║     SCRAPER - BOURSE DE CASABLANCA                         ║
    ║     Extraction complète des cotations                      ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    # Créer l'instance du scraper
    scraper = CasablancaBourseScaper()
    
    try:
        # Exécuter le scraping
        stocks = scraper.run()
        
        # Afficher le résumé
        scraper.print_summary()
        
        # Exporter les données
        if stocks:
            scraper.export_to_csv('bourse_casablanca.csv')
            scraper.export_to_json('bourse_casablanca.json')
            
            print("\n✅ Scraping terminé avec succès!")
            print(f"📁 Fichiers générés:")
            print(f"   - bourse_casablanca.csv")
            print(f"   - bourse_casablanca.json")
        else:
            print("\n⚠️  Aucune donnée n'a été extraite")
            print("Vérifiez la connexion et la structure du site")
        
    except Exception as e:
        logger.error(f"❌ Erreur critique: {e}")
        print(f"\n❌ Le scraping a échoué: {e}")
        raise


if __name__ == "__main__":
    main()
