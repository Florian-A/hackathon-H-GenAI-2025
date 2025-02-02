import pymysql
import json
import os

# Variables d'environnement à définir dans AWS Lambda
DB_HOST = os.environ['DB_HOST']
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']
DB_NAME = "h-gen-ai-database"

def lambda_handler(event, context):
    try:
        # Vérifier si la requête est bien en POST et contient un body
        if event.get("httpMethod") != "POST" or "body" not in event:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid request method or missing body"})
            }
        
        # Extraire la requête SQL depuis le body
        body = json.loads(event["body"])
        sql_query = body.get("query")
        
        if not sql_query:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing SQL query in request body"})
            }
        
        # Connexion à la base de données
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
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
        if 'connection' in locals():
            connection.close()
