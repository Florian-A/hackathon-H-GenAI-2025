import boto3
import json
import botocore
import logging

from write_to_hds import hds_writer

logging.basicConfig(level=logging.INFO)

DEFAULT_MISTRAL_MODEL = "mistral.mixtral-8x7b-instruct-v0:1"
DEFAULT_CLAUDE_MODEL  = "anthropic.claude-3-5-sonnet-20241022-v2:0"
DEFAULT_MAX_TOKENS    = 4096
DEFAULT_TEMPERATURE   = 0.5  # 0.3
DEFAULT_TOP_P         = 0.9  # 0.6
DEFAULT_TOP_K         = 50   # 10

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

sys_prompt = """
I have a dataset with these tables:
The table factures with the following columns:
CLE_ABONNEMENT
Identifiant de l'abonné
CLE_FACTURE
Identifiant de la facture. Plusieurs factures peuvent être associées à un même abonné.
DATE_EMISSION_FACTURE
Date d'émission de la facture
CONSO_FACTURE
La consommation qui apparaît dans la facture, qui est facturé au consommateur
DATE_RELEVE_INDEX_PRECEDENT_FACTURE_COMPOSITE
La consommation d'une facture se calcule par la différence d'un index. L'index "d'aujourd'hui" moins l'index "d'hier". Ici il s'agit de la date de relevé de l'index le plus ancien ayant servi au calcul de la consommation.
DATE_RELEVE_INDEX_FACTURE
Date de relevé de l'index le plus récent ayant servi au calcul de la consommation.
NB_FACTURES_PAR_PDS
Le nombre de factures par point de service.
NB_JOURS_CONNUS
Le nombre de jours connus sur la facture (correspond normalement à la date de relevé index facture moins la date de relevé de l'index précédent)
NUM_FAC_PAR_PDS
L'ordre de la facture par point de service (1ère facture, 2ème facture, ...)

The table conso with the following columns:
CLE_PDS
L'identifiant du point de livraison. Le PDS se trouve dans l'identifiant abonnement. L'identifiant abonnement est composé de la manière suivante : "CLE_PDS" + ordre de l'abonné sur le point de service (par exemple "01", "02", ...). Un abonné peut effectivement changer sur un point de livraison.
LIBELLE_REGION
La région d'appartenance au point de livraison
LIBELLE_TERRITOIRE
Le territoire d'appartenance au point de livraison
CODE_CONTRAT
Le code du contrat de délégation de service public auquel est associé le point de livraison
LIBELLE_CATEGORIE_ABONNE
La catégorie de l'abonné (bâtiment collectif public / privé, industriel, professionnel, ...)
DIAMETRE_NOMINAL
Le diamètre nominal du compteur (plus le compteur est gros, plus la consommation doit être élevé)
TYPE_ABAQUE
Le type de méthode qui nous a permis de calculer la consommation (est-on sur du ML, sur du télérelevé, ...)
MOIS_CONSO
Le mois concerné par la consommation
ANNEE_CONSO
L'année de la consommation
DATE_CONSO_MOIS
La date liée à la consommation
VOLUME_MOIS
Le volume consommé sur le mois / année en question

The table abonnements with the following columns:
CLE_ABONNEMENT
L'identifiant de l'abonnement
DATE_ENTREE_LOCAL_ABONNEMENT
La date d'entrée de l'abonné dans le logement
DATE_SOUSCRIPTION_ABONNEMENT
La date à laquelle l'abonné a souscrit un abonnement
DATE_RESILIATION_ABONNEMENT
La date de résiliation de l'abonné. Quand l'abonné est hors d'une période active (entre souscription et résiliation), il ne doit pas y avoir de consommations.


In order to transform the CLE_ABONNEMENT in CLE_PDS, the mapping is done as follows:
CLE_PDS = REPLACE(LEFT(CLE_ABONNEMENT, LENGTH(CLE_ABONNEMENT) - 2), '_', '|')

I want you to find the correlation between the tables and between the columns.
Your role is to return me a list of columns that should be correlated, or equal.
I expect from you a json format that should look like:
[
{
"candidate_feature_combo": ["taille_du_batiment","releve1","releve2"],
"reason_why_it_is_a_candidate": "reason..."
},
...
]

return me only the json
"""

def generate_prompt_dependency_template(dependency):
	return f"""
Given this dependency: {dependency}

I want to get all the data that do not comply with that check. Write me a SQL query that retrieves these lines.
return me only a json object with the following fields an nothing else: control_name, control_description, control_tables, control_sql

"""

def lambda_handler(event, context):
	bedrock_runtime = boto3.client(service_name = "bedrock-runtime", region_name='us-west-2')
	test_output = run_claude_prompt(
		bedrock_runtime,
		sys_prompt,
	)
	logging.info(test_output)
	test_to_run_json = json.loads(test_output)["correlations"]

	res = []
	for dependency in test_to_run_json:
		dependency_prompt = generate_prompt_dependency_template(dependency)
		dependency_query = run_claude_prompt(
			bedrock_runtime,
			dependency_prompt,
		)
		logging.info(dependency_query)
		# parsed_query = dependency_query.strip("`").replace("sql\n", "").strip()"
		dc = json.loads(dependency_query)
		dc["control_tables"] = ""
		res.append(dc)
		hds_writer(
			control_name = dc["control_name"],
			control_description = dc["control_name"],
			control_tables = dc["control_name"],
			control_sql = dc["control_name"]
		)
	return res