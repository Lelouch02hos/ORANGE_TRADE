
# ==================== BVC STOCKS (BOURSE DE CASABLANCA) ====================

@admin_bp.route('/api/admin/bvc-stocks', methods=['GET'])
@require_admin
def get_bvc_stocks(admin_user):
    """
    Récupère les cotations de la Bourse de Casablanca
    
    Query params:
        - symbols: Liste de symboles séparés par virgules (ex: IAM,ATW,BCP)
        - all: Si true, récupère toutes les actions disponibles
    """
    try:
        scraper = BVCScraper()
        
        # Récupérer les paramètres
        symbols_param = request.args.get('symbols')
        get_all = request.args.get('all', 'false').lower() == 'true'
        
        if get_all:
            # Récupérer toutes les actions disponibles
            logger.info("Récupération de toutes les actions BVC...")
            stocks_data = scraper.get_all_available_stocks()
            
        elif symbols_param:
            # Récupérer les actions spécifiques
            symbols = [s.strip() for s in symbols_param.split(',')]
            logger.info(f"Récupération des actions: {symbols}")
            stocks_data = scraper.get_multiple_stocks(symbols)
            
        else:
            # Par défaut, récupérer les principales actions
            default_symbols = ['IAM', 'ATW', 'BCP', 'CIH', 'BOA', 'LHM', 'ADH']
            stocks_data = scraper.get_multiple_stocks(default_symbols)
        
        # Formatter les données pour la réponse
        stocks_list = []
        for symbol, data in stocks_data.items():
            stocks_list.append({
                'symbol': symbol,
                'name': symbol,  # Le nom complet pourrait être ajouté dans le scraper
                'price': data.get('price', 0),
                'currency': data.get('currency', 'MAD'),
                'source': data.get('source', 'BVC'),
                'timestamp': data.get('timestamp', datetime.now().isoformat()),
                'status': 'success' if data.get('price', 0) > 0 else 'error'
            })
        
        # Log de l'action admin
        log_admin_action(
            admin_user.id, 
            'bvc_stocks_fetched', 
            details=f"Fetched {len(stocks_list)} BVC stocks"
        )
        
        return jsonify({
            'success': True,
            'count': len(stocks_list),
            'stocks': stocks_list,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des actions BVC: {e}")
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}',
            'stocks': []
        }), 500

@admin_bp.route('/api/admin/bvc-stocks/<symbol>', methods=['GET'])
@require_admin
def get_bvc_stock_detail(admin_user, symbol):
    """
    Récupère les détails d'une action BVC spécifique
    """
    try:
        scraper = BVCScraper()
        stock_data = scraper.get_stock_price(symbol.upper())
        
        if stock_data and stock_data.get('price', 0) > 0:
            return jsonify({
                'success': True,
                'stock': stock_data
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Action {symbol} non trouvée'
            }), 404
            
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de {symbol}: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
