# database/db.py - VERSÃO CORRIGIDA
import pymongo
import os
from dotenv import load_dotenv

# IMPORTANTE: Carregar variáveis de ambiente
load_dotenv()

# Carregar configurações do ambiente
mongourl = os.getenv("MONGO_URL", "mongodb://localhost:27017")
dbnome = os.getenv("DB_NAME", "dndvtt")

print(f"🔍 Conectando ao MongoDB...")
print(f"📍 URL: {mongourl[:50]}...")
print(f"🗄️  Banco: {dbnome}")

try:
    # Configurações otimizadas para MongoDB Atlas
    client = pymongo.MongoClient(
        mongourl,
        serverSelectionTimeoutMS=10000,  # 10 segundos
        connectTimeoutMS=10000,
        socketTimeoutMS=20000,
        retryWrites=True,
        maxPoolSize=10,
        minPoolSize=1
    )

    # Testar conexão
    client.admin.command('ping')
    mydb = client[dbnome]

    print(f"✅ Conectado ao MongoDB Atlas!")
    print(f"✅ Banco '{dbnome}' pronto para uso")

except Exception as e:
    print(f"❌ Erro na conexão: {e}")
    print("💡 Verifique as configurações no arquivo .env")
    # Em caso de erro, ainda criar o objeto para evitar import errors
    client = None
    mydb = None