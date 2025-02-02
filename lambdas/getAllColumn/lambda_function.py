import json
import pymysql
import os

def lambda_handler(event, context):

    # Extraire l'input prompt de l'événement
    table_name = event.get('table_name', 'conso')

     # Récupérer les variables d'environnement
    db_host     = os.environ['DB_HOST']
    db_user     = os.environ['DB_USER']
    db_password = os.environ['DB_PASSWORD']
    db_name     = os.environ['DB_NAME']

    # Se connecter à la base de données
    connection = pymysql.connect(
        host        = db_host,
        user        = db_user,
        password    = db_password,
        database    = db_name,
        cursorclass = pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            sql = f"SELECT COLUMN_NAME as column_name, TABLE_NAME as table_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'veolia' AND TABLE_NAME = '{table_name}';"
            cursor.execute(sql)
            result = cursor.fetchall()
    finally:
        connection.close()
        
    return result
