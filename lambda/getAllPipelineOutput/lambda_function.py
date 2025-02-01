import pymysql
import json
import os

# Variables d'environnement à définir dans AWS Lambda
DB_HOST = os.environ['DB_HOST']
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']
DB_NAME = "h-gen-ai-database"  # Correction : définition explicite du nom de la DB

def lambda_handler(event, context):
    try:
        # Connexion à MySQL avec la bonne base de données
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,  # Utilisation explicite de la base "pipeline_db"
            cursorclass=pymysql.cursors.DictCursor
        )

        with connection.cursor() as cursor:
            sql = "SELECT * FROM pipeline_output"  # Correction : utiliser la table "pipeline_output"
            cursor.execute(sql)
            result = cursor.fetchall()

        return {
            "statusCode": 200,
            "body": json.dumps(result, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

    finally:
        if connection:
            connection.close()