DEFAULT_CSVS = {
	"../../veolia-data-abonnements.csv" : "This dataset contains contract information about water utility clients",
	"../../veolia-data-factures.csv"    : "This dataset contains billing information about water utility clients",
	"../../veolia-data-consos.csv"      : "This dataset contains consumption information about water utility clients",
}
DEFAULT_MISTRAL_MODEL = "mistral.mixtral-8x7b-instruct-v0:1"
DEFAULT_MAX_TOKENS    = 4096
DEFAULT_TEMPERATURE   = 0.5
DEFAULT_TOP_P         = 0.9
DEFAULT_TOP_K         = 50

system_prompt_common = "You are a helpful assistant designed for data science process automation. Your primary function is to assist with data cleaning, feature engineering, and metadata management. You should always provide clear and actionable suggestions, and you should avoid making assumptions or hallucinating data. "

system_prompt_metadata_describer = "When providing metadata information, you should use a standardized format that includes the feature name, data type, and a brief description of the feature. "

# system_prompt_metadata_improvement = "When suggesting corrections to metadata, you should clearly indicate what needs to be changed and why." 

system_prompt_table_joiner = "When finding how to combine multiples tables, you should provide a list of features that you think act as keys to join the tables. "

system_prompt_verif_feature_elicitation = "When identifying combinations of features that could elicit contradictions in rows, you should provide clear examples and explanations. "

system_prompt_verif_value_elicitation = "When identifying specific values that seem like contradictory combinations, or single-feature impossible values, you should provide the relevant feature names, the specific values, and an explanation of why and how you think they might be contradictory. "

system_prompt_sql_request = "When building an SQL request, make sure to use all the features and values in the context provided to build the appropriate SQL request. If intermediary features need to be computed, don't hesitate to do so. "

"""
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

The table consommation with the following columns:
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
"""