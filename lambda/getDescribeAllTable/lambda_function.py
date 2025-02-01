import pymysql
import json
import os

# Variables d'environnement à définir dans AWS Lambda
DB_HOST = os.environ['DB_HOST']
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']
DB_NAME = "h-gen-ai-database"  # Spécification explicite de la base de données

def lambda_handler(event, context):
    try:
        # Connexion à MySQL
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )

        with connection.cursor() as cursor:
            # Requête pour récupérer les tables de la base de données
            cursor.execute("SHOW TABLES")
            tables = [list(row.values())[0] for row in cursor.fetchall()]

            # Décrire chaque table
            table_descriptions = {}
            for table in tables:
                cursor.execute(f"DESCRIBE {table}")
                table_descriptions[table] = cursor.fetchall()

        return {
            "statusCode": 200,
            "body": json.dumps(table_descriptions, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

    finally:
        if 'connection' in locals():
            connection.close()
