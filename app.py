from flask import Flask
from routes.auth import auth_bp
from routes.character import character_bp
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)

# Configurações básicas
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'sua-chave-secreta-aqui')

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(character_bp, url_prefix='/characters')

@app.route('/')
def home():
    return {"message": "API funcionando!"}

if __name__ == '__main__':
    debug_mode = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode)