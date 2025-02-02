import json
import os
import sys
import boto3
import botocore
import logging

logging.basicConfig(level=logging.INFO)

def lambda_handler(event, context):

    bedrock = boto3.client(service_name="bedrock", region_name='us-west-2')
    bedrock_runtime = boto3.client(service_name="bedrock-runtime", region_name='us-west-2')

    # Définir les paramètres du modèle
    model_id = "mistral.mixtral-8x7b-instruct-v0:1"
    content_type = "application/json"
    accept = "application/json"

    # Extraire l'input prompt de l'événement
    control_name        = event.get('control_name', 'DIAMETRE_NOMINAL NON NULL')
    control_description = event.get('control_description', 'Vérification des valeurs NULL dans la colonne DIAMETRE_NOMINAL')
    control_tables      = event.get('control_tables', 'conso')
    input_column_name   = event.get('column_name', 'DIAMETRE_NOMINAL')
    default_prompt      = f"<s>[INST] Donne moi une requête SQL qui permet de vérifier qu'il s'il y a des nulls dans la colonne {input_column_name} de la table {control_tables} ? Répondre uniquement en ne donnant que la requête SQL [/INST]"
    input_prompt        = event.get('prompt', default_prompt)
    max_tokens          = event.get('max_tokens', 200)
    temperature         = event.get('temperature', 0.5)
    top_p               = event.get('top_p', 0.9)
    top_k               = event.get('top_k', 50)

    logging.info("input_column_name : %s", input_column_name)

    # Créer le corps de la requête
    body = {
        "prompt"      : input_prompt,
        "max_tokens"  : max_tokens,
        "temperature" : temperature,
        "top_p"       : top_p,
        "top_k"       : top_k
    }

    # Faire la requête au modèle
    response = bedrock_runtime.invoke_model(
        modelId     = model_id,
        contentType = content_type,
        accept      = accept,
        body        = json.dumps(body)
    )

    response_output    = json.loads(response.get('body').read())
    mistral_parse_text = response_output['outputs'][0]['text']
    mistral_parse_text = mistral_parse_text.replace('\n', ' ')
    mistral7b_output   = mistral_parse_text.strip()

    return json.dumps({'control_name' : control_name,
            'control_description': control_description,
            'control_tables': control_tables,
            'control_sql': mistral7b_output})
