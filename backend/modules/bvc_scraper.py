"""
Scraper pour la Bourse de Casablanca (BVC)
Récupère les prix en temps réel des actions marocaines
"""

import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BVCScraper:
    """
    Scraper pour la Bourse des Valeurs de Casablanca
    """
    
    BASE_URL = "https://www.casablanca-bourse.com"
    
    # Mapping des symboles couramment utilisés
    SYMBOL_MAP = {
        'IAM': 'IAM',  # Maroc Telecom
        'ATW': 'ATW',  # Attijariwafa Bank
        'BCP': 'BCP',  # Banque Centrale Populaire
        'CIH': 'CIH',  # CIH Bank
        'GAZ': 'GAZ',  # Afriquia Gaz
        'LHM': 'LHM',  # LafargeHolcim Maroc
        'MNG': 'MNG',  # Managem
        'ONA': 'ONA',  # ONA (Holding)
        'SAM': 'SAM',  # Samir
        'SNI': 'SNI',  # SNI (Société Nationale d'Investissement)
        'TQM': 'TQM',  # Taqa Morocco
        'WAA': 'WAA',  # Wafa Assurance
    }
    
    # Prix de fallback pour la démo (en MAD)
    FALLBACK_PRICES = {
        'IAM': 120.50,
        'ATW': 485.00,
        'BCP': 265.00,
        'CIH': 315.00,
        'GAZ': 4850.00,
        'LHM': 1750.00,
        'MNG': 850.00,
        'ONA': 8500.00,
        'SAM': 350.00,
        'SNI': 950.00,
        'TQM': 850.00,
        'WAA': 3800.00,
    }
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def get_stock_price(self, symbol: str) -> dict:
        """
        Récupère le prix d'une action marocaine
        
        Args:
            symbol: Code de l'action (ex: IAM, ATW)
            
        Returns:
            dict: {'symbol': str, 'price': float, 'currency': str, 'timestamp': str, 'source': str}
        """
        # Normaliser le symbole
        symbol = symbol.upper().replace('.MA', '')
        
        if symbol not in self.SYMBOL_MAP:
            logger.warning(f"Symbol {symbol} not in known BVC symbols")
            return None
        
        try:
            # Essayer de scraper le site de la BVC
            price_data = self._scrape_bvc_website(symbol)
            if price_data:
                return price_data
        except Exception as e:
            logger.error(f"Error scraping BVC website for {symbol}: {e}")
        
        try:
            # Alternative: utiliser l'API de Boursorama (pour les actions marocaines listées)
            price_data = self._fetch_from_boursorama(symbol)
            if price_data:
                return price_data
        except Exception as e:
            logger.error(f"Error fetching from Boursorama for {symbol}: {e}")
        
        # Fallback: utiliser les prix de démo
        logger.info(f"Using fallback price for {symbol}")
        return {
            'symbol': symbol,
            'price': self.FALLBACK_PRICES.get(symbol, 100.0),
            'currency': 'MAD',
            'timestamp': datetime.now().isoformat(),
            'source': 'fallback',
            'variation': 0.0
        }
    
    def _scrape_bvc_website(self, symbol: str) -> dict:
        """
        Scrape le site officiel de la Bourse de Casablanca
        """
        try:
            # URL de la page de cotation
            url = f"{self.BASE_URL}/bourseweb/Cours-Bourse.aspx"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Rechercher le prix dans le tableau des cotations
            # (La structure exacte dépend du site actuel de la BVC)
            price = self._extract_price_from_html(soup, symbol)
            
            if price:
                return {
                    'symbol': symbol,
                    'price': price,
                    'currency': 'MAD',
                    'timestamp': datetime.now().isoformat(),
                    'source': 'bvc_website'
                }
            
            return None
        except Exception as e:
            logger.error(f"Error in _scrape_bvc_website: {e}")
            return None
    
    def _extract_price_from_html(self, soup: BeautifulSoup, symbol: str) -> float:
        """
        Extrait le prix depuis le HTML de la BVC
        """
        try:
            # Chercher dans les tableaux
            tables = soup.find_all('table')
            
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    # Chercher le symbole dans la ligne
                    if any(symbol in cell.get_text().strip() for cell in cells):
                        # Le prix est généralement dans une des colonnes suivantes
                        for cell in cells:
                            text = cell.get_text().strip()
                            # Chercher un nombre qui ressemble à un prix
                            match = re.search(r'(\d+[\.,]\d+)', text)
                            if match:
                                price_str = match.group(1).replace(',', '.')
                                return float(price_str)
            
            return None
        except Exception as e:
            logger.error(f"Error extracting price from HTML: {e}")
            return None
    
    def _fetch_from_boursorama(self, symbol: str) -> dict:
        """
        Alternative: récupérer depuis Boursorama (certaines actions marocaines y sont listées)
        """
        try:
            # Boursorama utilise des codes spéciaux
            boursorama_codes = {
                'IAM': '1rPIAM',
                'ATW': '1rPATW',
            }
            
            if symbol not in boursorama_codes:
                return None
            
            code = boursorama_codes[symbol]
            url = f"https://www.boursorama.com/cours/{code}/"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Chercher le prix dans la page
            price_elem = soup.find('span', class_='c-instrument--last')
            if price_elem:
                price_text = price_elem.get_text().strip()
                price = float(re.sub(r'[^\d,.]', '', price_text).replace(',', '.'))
                
                return {
                    'symbol': symbol,
                    'price': price,
                    'currency': 'MAD',
                    'timestamp': datetime.now().isoformat(),
                    'source': 'boursorama'
                }
            
            return None
        except Exception as e:
            logger.error(f"Error in _fetch_from_boursorama: {e}")
            return None
    
    def get_multiple_stocks(self, symbols: list) -> dict:
        """
        Récupère les prix de plusieurs actions
        """
        results = {}
        for symbol in symbols:
            data = self.get_stock_price(symbol)
            if data:
                results[symbol] = data
        return results
    
    def get_all_available_stocks(self) -> dict:
        """
        Récupère tous les prix disponibles
        """
        return self.get_multiple_stocks(list(self.SYMBOL_MAP.keys()))


# API Helper Functions
def get_bvc_price(symbol: str) -> float:
    """
    Fonction helper pour récupérer rapidement un prix
    
    Args:
        symbol: Code de l'action (ex: IAM, ATW)
        
    Returns:
        float: Prix en MAD
    """
    scraper = BVCScraper()
    data = scraper.get_stock_price(symbol)
    return data['price'] if data else None


def get_bvc_data(symbol: str) -> dict:
    """
    Fonction helper pour récupérer les données complètes
    
    Args:
        symbol: Code de l'action
        
    Returns:
        dict: Données complètes de l'action
    """
    scraper = BVCScraper()
    return scraper.get_stock_price(symbol)


# Instance globale pour éviter de recréer le scraper à chaque fois
_scraper_instance = None

def get_scraper():
    """Retourne une instance singleton du scraper"""
    global _scraper_instance
    if _scraper_instance is None:
        _scraper_instance = BVCScraper()
    return _scraper_instance


if __name__ == "__main__":
    # Test du scraper
    scraper = BVCScraper()
    
    print("=== Test du Scraper BVC ===\n")
    
    # Test avec quelques actions
    test_symbols = ['IAM', 'ATW', 'BCP']
    
    for symbol in test_symbols:
        data = scraper.get_stock_price(symbol)
        if data:
            print(f"{symbol}:")
            print(f"  Prix: {data['price']} {data['currency']}")
            print(f"  Source: {data['source']}")
            print(f"  Timestamp: {data['timestamp']}")
            print()
    
    # Test récupération multiple
    print("\n=== Récupération Multiple ===")
    all_data = scraper.get_multiple_stocks(['IAM', 'ATW', 'BCP', 'CIH'])
    for symbol, data in all_data.items():
        print(f"{symbol}: {data['price']} {data['currency']} (source: {data['source']})")
