import json
import os
import sys

import pandas as pd
import boto3
import botocore
from typing import List


from consts      import *
from agent_utils import *


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

def generate_columns_dependencies_prompts(
	databse_description : str
) -> List[str]:
	prompt = f"""I have a dataset with different tables. Here is the description of the tables and their columns: {databse_description}.
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
	"""
	return prompt


def generate_request_from_tables_dependencies(
	dataset_description  : str,
	columns_dependency : str
) -> str:
	prompt = f"""
		I have a dataset. Here is the description of the dataset: {dataset_description}.
		I have identified the following dependencies between columns.
		Here is the dependency : {columns_dependency}.
		I want to see all the lines that do not comply with the givent correlation.
		Write me a SQL query that will highlight the potential problems in the problem.
	"""
	return prompt

def parse_agent2_output(agent2_output : str) -> List:
	return json.loads(agent2_output)


def main():
	# bedrock         = boto3.client(service_name="bedrock",         region_name='us-west-2')
	bedrock_runtime = boto3.client(service_name = "bedrock-runtime", region_name='us-west-2')
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
		prompt          = description_agent_prompt,
	)
	print(agent1_output)


	agent2_input = generate_columns_dependencies_prompts(agent1_output)
	agent2_output = run_mistral_prompt(
		bedrock_runtime = bedrock_runtime,
		prompt          = agent2_input,
	)

	result = []
	parsed_agent2_output = parse_agent2_output(agent2_output)
	for dependency in parsed_agent2_output:
		agen_sql_prompt = generate_request_from_tables_dependencies(agent1_output, dependency)
		sql_query = run_mistral_prompt(
			bedrock_runtime = bedrock_runtime,
			prompt          = agen_sql_prompt,
		)
		result.append(sql_query)
	
	return result


if __name__ == "__main__":
	main()
