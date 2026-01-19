"""
Script de Web Scraping AVANCÉ - Bourse de Casablanca avec Selenium
====================================================================
Version avec navigation JavaScript pour sites dynamiques
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
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


class CasablancaBourseSeleniumScraper:
    """
    Scraper avec Selenium pour gérer le JavaScript
    """
    
    def __init__(self, headless: bool = True):
        """
        Initialisation du scraper avec Selenium
        
        Args:
            headless: Exécuter Chrome en mode headless (sans interface)
        """
        self.base_url = "https://www.casablanca-bourse.com"
        self.stocks_data = []
        self.driver = None
        self.headless = headless
        
    def setup_driver(self):
        """Configure le driver Chrome"""
        logger.info("Configuration du driver Chrome...")
        
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument('--headless')
        
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            logger.info("✅ Driver Chrome configuré")
        except Exception as e:
            logger.error(f"❌ Erreur de configuration du driver: {e}")
            raise
    
    def wait_for_element(self, by: By, value: str, timeout: int = 10):
        """
        Attend qu'un élément soit présent
        
        Args:
            by: Type de sélecteur (BY.ID, BY.CLASS_NAME, etc.)
            value: Valeur du sélecteur
            timeout: Temps d'attente maximum
        """
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            logger.warning(f"Timeout en attendant l'élément: {value}")
            return None
    
    def scrape_cotations_page(self) -> List[Dict]:
        """
        Scrape la page des cotations
        
        Returns:
            Liste des actions extraites
        """
        logger.info("Navigation vers la page des cotations...")
        
        cotations_url = f"{self.base_url}/fr/cotations/actions"
        
        try:
            self.driver.get(cotations_url)
            
            # Attendre le chargement de la page
            time.sleep(3)
            
            # Attendre la table des cotations
            table = self.wait_for_element(By.TAG_NAME, 'table')
            
            if not table:
                logger.error("Table des cotations non trouvée")
                return []
            
            stocks = []
            
            # Extraire les lignes du tableau
            rows = self.driver.find_elements(By.TAG_NAME, 'tr')[1:]  # Skip header
            
            logger.info(f"Traitement de {len(rows)} lignes...")
            
            for row in rows:
                try:
                    cols = row.find_elements(By.TAG_NAME, 'td')
                    
                    if len(cols) >= 4:
                        stock = {
                            'nom': cols[0].text.strip(),
                            'symbole': cols[1].text.strip() if len(cols) > 1 else 'N/A',
                            'dernier_cours': self._parse_number(cols[2].text if len(cols) > 2 else '0'),
                            'variation_pct': self._parse_number(cols[3].text if len(cols) > 3 else '0'),
                            'volume': self._parse_number(cols[4].text if len(cols) > 4 else '0'),
                            'plus_haut': self._parse_number(cols[5].text if len(cols) > 5 else '0'),
                            'plus_bas': self._parse_number(cols[6].text if len(cols) > 6 else '0'),
                            'date_extraction': datetime.now().isoformat()
                        }
                        
                        if stock['nom'] and stock['nom'] not in ['N/A', '']:
                            stocks.append(stock)
                            logger.debug(f"✓ {stock['nom']}")
                
                except Exception as e:
                    logger.warning(f"Erreur lors du parsing d'une ligne: {e}")
                    continue
            
            logger.info(f"✅ {len(stocks)} actions extraites")
            return stocks
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping: {e}")
            return []
    
    def scrape_indices(self) -> Dict:
        """
        Extrait les indices boursiers (MASI, MADEX, etc.)
        
        Returns:
            Dictionnaire des indices
        """
        logger.info("Extraction des indices...")
        
        try:
            indices_url = f"{self.base_url}/fr/indices"
            self.driver.get(indices_url)
            time.sleep(2)
            
            indices = {}
            
            # Rechercher les éléments d'indices
            index_elements = self.driver.find_elements(By.CLASS_NAME, 'index-item')
            
            for elem in index_elements:
                try:
                    name = elem.find_element(By.CLASS_NAME, 'index-name').text
                    value = self._parse_number(elem.find_element(By.CLASS_NAME, 'index-value').text)
                    variation = self._parse_number(elem.find_element(By.CLASS_NAME, 'index-variation').text)
                    
                    indices[name] = {
                        'valeur': value,
                        'variation': variation
                    }
                except:
                    continue
            
            logger.info(f"✅ {len(indices)} indices extraits")
            return indices
            
        except Exception as e:
            logger.warning(f"Erreur lors de l'extraction des indices: {e}")
            return {}
    
    def _parse_number(self, text: str) -> float:
        """Parse un nombre depuis une chaîne"""
        try:
            text = text.strip().replace(' ', '').replace('\xa0', '').replace('%', '')
            text = text.replace(',', '.')
            text = ''.join(c for c in text if c.isdigit() or c in ['.', '-'])
            return float(text) if text else 0.0
        except:
            return 0.0
    
    def run(self) -> List[Dict]:
        """
        Exécute le scraping complet
        
        Returns:
            Liste des actions
        """
        logger.info("🚀 Démarrage du scraping avec Selenium...")
        
        try:
            self.setup_driver()
            
            # Scraper les cotations
            self.stocks_data = self.scrape_cotations_page()
            
            # Scraper les indices (optionnel)
            # indices = self.scrape_indices()
            
            return self.stocks_data
            
        except Exception as e:
            logger.error(f"❌ Erreur critique: {e}")
            raise
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("Driver fermé")
    
    def export_to_csv(self, filename: str = 'bourse_casablanca_selenium.csv'):
        """Exporte en CSV"""
        if not self.stocks_data:
            return
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=self.stocks_data[0].keys())
            writer.writeheader()
            writer.writerows(self.stocks_data)
        
        logger.info(f"✅ Export CSV: {filename}")
    
    def export_to_json(self, filename: str = 'bourse_casablanca_selenium.json'):
        """Exporte en JSON"""
        if not self.stocks_data:
            return
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    'source': 'Bourse de Casablanca (Selenium)',
                    'date': datetime.now().isoformat(),
                    'count': len(self.stocks_data)
                },
                'actions': self.stocks_data
            }, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✅ Export JSON: {filename}")


def main():
    """Fonction principale"""
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║     SCRAPER SELENIUM - BOURSE DE CASABLANCA                ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    scraper = CasablancaBourseSeleniumScraper(headless=True)
    
    try:
        stocks = scraper.run()
        
        if stocks:
            print(f"\n✅ {len(stocks)} actions extraites\n")
            
            # Afficher aperçu
            for i, stock in enumerate(stocks[:5], 1):
                print(f"{i}. {stock['nom']} - {stock['dernier_cours']} MAD ({stock['variation_pct']}%)")
            
            # Exporter
            scraper.export_to_csv()
            scraper.export_to_json()
            
            print(f"\n📁 Fichiers générés:")
            print(f"   - bourse_casablanca_selenium.csv")
            print(f"   - bourse_casablanca_selenium.json")
        else:
            print("\n⚠️  Aucune donnée extraite")
    
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        raise


if __name__ == "__main__":
    main()
