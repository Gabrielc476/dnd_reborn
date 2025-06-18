import pymongo
import os

# Carregar configurações do ambiente
mongourl = os.getenv("MONGO_URL", "mongodb://localhost:27017")
dbnome = os.getenv("DB_NAME", "myapp")

client = pymongo.MongoClient(mongourl)
mydb = client[dbnome]