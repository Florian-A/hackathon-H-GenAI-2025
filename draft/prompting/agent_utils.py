import json
import os
import sys

import pandas as pd
import boto3
import botocore

import anthropic

from consts import *


def combine_prompts(
	system_prompt : str,
	human_prompt  : str,
) -> str:
	result = "System: " + system_prompt_common + system_prompt + "\n" + "Human: " + human_prompt
	return result.replace('\n', ' ').replace('\t', ' ').replace('  ', ' ').replace("\"", "\\\"")  # .replace("'", "\\'")


def run_mistral_prompt(
	bedrock_runtime : botocore.client,
	prompt          : str,
	model_id        : str   = DEFAULT_MISTRAL_MODEL,
	max_tokens      : int   = DEFAULT_MAX_TOKENS,
	temperature     : float = DEFAULT_TEMPERATURE,
	top_p           : float = DEFAULT_TOP_P,
	top_k           : int   = DEFAULT_TOP_K
) -> str:
	message_body = f"""{{"prompt":"{prompt}", "max_tokens":{max_tokens}, "temperature":{temperature}, "top_p":{top_p}, "top_k":{top_k}}}"""
	response        = bedrock_runtime.invoke_model(
		body        = message_body,
		modelId     = model_id,
		accept      = "application/json",
		contentType = "application/json",
	)
	response_output    = json.loads(response.get('body').read())
	mistral_parse_text = response_output['outputs'][0]['text']
	# mistral_parse_text = mistral_parse_text.replace('\n', ' ')
	mistral7b_output   = mistral_parse_text.strip()
	return mistral7b_output

def run_claude_prompt(
	bedrock_runtime : botocore.client,
	prompt          : str,
	model_id        : str   = DEFAULT_CLAUDE_MODEL,
	max_tokens      : int   = DEFAULT_MAX_TOKENS,
	temperature     : float = DEFAULT_TEMPERATURE,
	top_p           : float = DEFAULT_TOP_P,
	top_k           : int   = DEFAULT_TOP_K
) -> str:
	message_body = json.dumps({
		"anthropic_version": "bedrock-2023-05-31",
		"max_tokens": max_tokens,
		"temperature": temperature,
		"messages": [
			{"role": "user", "content": prompt}
		]
	})
	response        = bedrock_runtime.invoke_model(
		body        = message_body,
		modelId     = model_id,
		accept      = "application/json",
		contentType = "application/json",
	)
	response_output    = json.loads(response.get('body').read())
	anthropic_parse_text = response_output['content'][0]['text']
	# mistral_parse_text = mistral_parse_text.replace('\n', ' ')
	anthropic_output   = anthropic_parse_text.strip()
	return anthropic_output


def lambda_handler(event, context):

    bedrock = boto3.client(service_name="bedrock", region_name='us-west-2')
    bedrock_runtime = boto3.client(service_name="bedrock-runtime", region_name='us-west-2')

     # Définir les paramètres du modèle
    model_id     = "mistral.mixtral-8x7b-instruct-v0:1"
    content_type = "application/json"
    accept       = "application/json"

    # Extraire l'input prompt de l'événement
    input_prompt = event.get('prompt', "<s>[INST] Quelle est la capitale de la slovaquie ? [/INST]")
    max_tokens   = event.get('max_tokens', 200)
    temperature  = event.get('temperature', 0.5)
    top_p        = event.get('top_p', 0.9)
    top_k        = event.get('top_k', 50)

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

    return {
        'statusCode': 200,
        'body': json.dumps(mistral7b_output)
    }