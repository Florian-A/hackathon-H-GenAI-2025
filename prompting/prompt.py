import json
import os
import sys

import pandas as pd
import boto3
import botocore


DEFAULT_CSV_FILE_PATH = "../../veolia-data-abonnements.csv"
DEFAULT_MISTRAL_MODEL = "mistral.mixtral-8x7b-instruct-v0:1"
DEFAULT_MAX_TOKENS    = 4096
DEFAULT_TEMPERATURE   = 0.5
DEFAULT_TOP_P         = 0.9
DEFAULT_TOP_K         = 50

system_prompt_common = "You are a helpful assistant designed for data science process automation. Your primary function is to assist with data cleaning, feature engineering, and metadata management. You should always provide clear and actionable suggestions, and you should avoid making assumptions or hallucinating data. "

system_prompt_metadata_describer = "When providing metadata information, you should use a standardized format that includes the feature name, data type, and a brief description of the feature. "

# system_prompt_metadata_improvement = "When suggesting corrections to metadata, you should clearly indicate what needs to be changed and why." 

system_prompt_verif_feature_elicitation = "When identifying combinations of features that could elicit contradictions in rows, you should provide clear examples and explanations. "

system_prompt_verif_value_elicitation = "When identifying specific values that seem like contradictory combinations, or single-feature impossible values, you should provide the relevant feature names, the specific values, and an explanation of why and how you think they might be contradictory. "

system_prompt_sql_request = "When building an SQL request, make sure to use all the features and values in the context provided to build the appropriate SQL request. If intermediary features need to be computed, don't hesitate to do so. "



def render_from_df__human__prompt_metadata_describer(
	df                  : pd.DataFrame,
	df_text_description : str,
	sample_size         : int = 10
) -> str:

	prompt_header = """Please analyze the following data and provide metadata information, suggestions for corrections, and any identified contradictions or inconsistencies. Here is a description of the data:\n"""

	df_info = "Result from df.describe():\n" + str(df.describe(include='all')).replace('\t',"|") + "\n\n"
	# df_categorical_data_sample

	df_sample = "Small samlple of the dataset:\n" + str(df.sample(sample_size)).replace('\t',"|") + "\n\n"

	prompt_footer = """[INST]
	Based on this information, please provide a JSON, with, for each column, a metadata summary. This JSON should be a list of dictionaries, and each dictionary should contain:
	    - name: feature name
	    - data type: data type of the feature
	    - description: a brief description of the feature
	    - range: range of the feature (if applicable)
	    - nature: whether the data is quantitative cardinal, quantitative ordinal, categorical, or an ID key
	Please provide only the uglified JSON and nothing else.[/INST]"""

	prompt = (
		prompt_header +
		df_text_description +
		df_info +
		df_sample +
		prompt_footer
	)
	return prompt


def combine_prompts(
	system_prompt : str,
	human_prompt  : str,
) -> str:
	result = "System: " + system_prompt_common + "\n" + "Human: " + human_prompt
	return result.replace('\n', ' ').replace('\t', ' ').replace('  ', ' ')


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
	mistral_parse_text = mistral_parse_text.replace('\n', ' ')
	mistral7b_output   = mistral_parse_text.strip()
	return mistral7b_output


def main():
	# bedrock         = boto3.client(service_name="bedrock",         region_name='us-west-2')
	bedrock_runtime = boto3.client(service_name="bedrock-runtime", region_name='us-west-2')
	test_human_prompt = render_from_df__human__prompt_metadata_describer(
		df                  = pd.read_csv(DEFAULT_CSV_FILE_PATH),
		df_text_description = "This dataset contains contract information about water utility clients",
	)
	description_agent_prompt = combine_prompts(
		system_prompt_metadata_describer,
		test_human_prompt,
	)
	print(description_agent_prompt)
	agent1_output = run_mistral_prompt(
		bedrock_runtime = bedrock_runtime,
		prompt         = description_agent_prompt,
	)
	print(agent1_output)




if __name__ == "__main__":
	main()
