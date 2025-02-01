import pymysql
import json
import os

# Variables d'environnement à définir dans AWS Lambda
DB_HOST = os.getenv("DB_HOST", "secret")
DB_USER = os.getenv("DB_USER", "secret")
DB_PASSWORD = os.getenv("DB_PASSWORD", "secret")
DB_NAME = os.getenv("DB_NAME", "secret")  # Correction : définition explicite du nom de la DB

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