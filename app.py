# app.py - D&D Manager Backend (Atualizado para MongoDB Atlas)
from flask import Flask, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.character import character_bp
from routes.campaign import campaign_bp
import os
import pymongo
from dotenv import load_dotenv
import logging

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app():
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    # Configurar CORS
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

    # Configurações básicas
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'development-key-change-in-production')
    app.config['DEBUG'] = os.getenv('DEBUG', 'False').lower() == 'true'

    return app


def test_database_connection():
    """Testa a conexão com o banco de dados"""
    try:
        mongo_url = os.getenv('MONGO_URL')
        db_name = os.getenv('DB_NAME')

        if not mongo_url or not db_name:
            logger.error("❌ Variáveis MONGO_URL ou DB_NAME não encontradas no .env")
            return False

        logger.info("🔍 Testando conexão com MongoDB Atlas...")

        # Conectar com timeout otimizado para Atlas
        client = pymongo.MongoClient(
            mongo_url,
            serverSelectionTimeoutMS=10000,  # 10 segundos
            connectTimeoutMS=10000,
            retryWrites=True
        )

        # Testar conexão
        client.admin.command('ping')
        logger.info("✅ Conexão com MongoDB Atlas estabelecida!")

        # Testar banco específico
        db = client[db_name]
        collections = db.list_collection_names()
        logger.info(f"📁 Banco '{db_name}' acessível. Coleções: {len(collections)}")

        return True

    except pymongo.errors.ServerSelectionTimeoutError:
        logger.error("❌ Timeout na conexão com MongoDB")
        logger.error("💡 Verifique sua conexão com internet e credenciais")
        return False
    except pymongo.errors.AuthenticationFailed:
        logger.error("❌ Falha na autenticação do MongoDB")
        logger.error("💡 Verifique usuário e senha no MongoDB Atlas")
        return False
    except Exception as e:
        logger.error(f"❌ Erro de conexão: {e}")
        return False


def register_routes(app):
    """Registra todas as rotas da aplicação"""
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(character_bp, url_prefix='/characters')
    app.register_blueprint(campaign_bp, url_prefix='/campaign')

    # Rota de health check
    @app.route('/')
    def health_check():
        return jsonify({
            "message": "🐉 D&D Manager API funcionando!",
            "status": "online",
            "version": "1.0.0"
        })

    # Rota para testar banco
    @app.route('/test-db')
    def test_db():
        try:
            mongo_url = os.getenv('MONGO_URL')
            client = pymongo.MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')

            db_name = os.getenv('DB_NAME')
            db = client[db_name]
            collections = db.list_collection_names()

            return jsonify({
                "status": "success",
                "message": "Banco conectado!",
                "database": db_name,
                "collections": collections
            })
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500

    # Rota para informações da API
    @app.route('/api/info')
    def api_info():
        return jsonify({
            "name": "D&D Manager API",
            "version": "1.0.0",
            "description": "API para gerenciamento de personagens e campanhas de D&D",
            "database": os.getenv('DB_NAME'),
            "debug": app.config['DEBUG']
        })

    logger.info("✅ Rotas registradas com sucesso")


def main():
    """Função principal da aplicação"""
    print("🐉" * 30)
    print("🎲 D&D MANAGER - INICIANDO SERVIDOR 🎲")
    print("🐉" * 30)

    # Verificar arquivo .env
    if not os.path.exists('.env'):
        logger.error("❌ Arquivo .env não encontrado!")
        logger.error("💡 Crie um arquivo .env com as configurações do MongoDB")
        return

    # Testar conexão com banco ANTES de iniciar o servidor
    if not test_database_connection():
        logger.error("❌ Não foi possível conectar ao banco de dados")
        logger.error("💡 Execute: python test_atlas_config.py para diagnosticar")
        return

    # Criar aplicação
    app = create_app()

    # Registrar rotas
    register_routes(app)

    # Configurações do servidor
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'

    logger.info(f"🚀 Iniciando servidor em http://{host}:{port}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info(f"🗄️  Database: {os.getenv('DB_NAME')}")

    try:
        app.run(
            host=host,
            port=port,
            debug=debug,
            threaded=True
        )
    except KeyboardInterrupt:
        logger.info("🛑 Servidor interrompido pelo usuário")
    except Exception as e:
        logger.error(f"❌ Erro ao iniciar servidor: {e}")


if __name__ == '__main__':
    main()