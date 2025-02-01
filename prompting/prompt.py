import json
import os
import sys

import pandas as pd
import boto3
import botocore
from typing import List


from consts      import *
from agent_utils import *


def sanitize(s:str):
	return s.replace('"', '`')

def extract_by_symbol(s:str, symbols:tuple[str,str]):
	first_pos = s.find(symbols[0])
	last_pos = s[::-1].find(symbols[1])
	print(f"{first_pos=}, {last_pos=}")
	if last_pos > 0:
		result = s[first_pos:-last_pos]
	else:
		result = s[first_pos:]
	return result


def render_from_df__human_prompt_metadata_describer(
	df                  : pd.DataFrame,
	df_text_description : str,
	sample_size         : int = 10
) -> str:

	prompt_header = """Please analyze the following data and provide metadata information, suggestions for corrections, and any identified contradictions or inconsistencies. Here is a description of the data:\n"""

	df_info = "Result from df.describe():\n" + str(df.describe(include='all')).replace('\t',"|") + "\n\n"
	# df_categorical_data_sample

	df_sample = "Small sample of the dataset:\n" + str(df.sample(sample_size)).replace('\t',"|") + "\n\n"

	prompt_footer = """[INST]
	Based on this information, please provide a JSON, with, for each column, a metadata summary. This JSON should be a list of dictionaries, and each dictionary should contain:
		- source: the name of the dataset
	    - name: feature name
	    - data type: data type of the feature
	    - description: a brief description of the feature
	    - sample: an array of samples of the feature
	    - nature: whether the data is quantitative cardinal, quantitative ordinal, categorical, or an ID key
	    - range: range of the feature (if applicable)

	Please provide only the uglified JSON and nothing else.[/INST]"""

	prompt = (
		prompt_header +
		df_text_description +
		df_info +
		df_sample +
		prompt_footer
	)
	return prompt

def render_from_metadata__human_prompt_table_joiner(
	tables_metadata : dict,
) -> str:
	prompt_header = """I have a dataset with different tables. Here is the description of the tables and their columns:\n"""
	tables_info = ""
	for table, metadata in tables_metadata.items():
		tables_info += f"Table: {sanitize(table)}\n" + sanitize(metadata) + "\n\n"

	prompt_footer = """[INST]
	Please provide a JSON array of pairs-of-pairs of features that you think act as keys to join the tables. Each pair-of-pair should contain 4 strings, and look like `((feature1_in_combination,source_dataset_of_feature1), (feature2_in_combination,source_dataset_of_feature2))`. 
	Please provide only the uglified JSON and nothing else.[/INST]"""
	return prompt_header + tables_info + prompt_footer


def render_columns_dependencies_prompts(
	database_description : str
) -> str:
	prompt = f"""I have a dataset with different tables. Here is the description of the tables and their columns: {sanitize(database_description)}.
		I want you to find the correlation between the tables and between the columns.
		Your role is to return me a list of columns that should be correlated, uncorrelated, or anticorrelated.
		I expect from you a json format that should look like:
		[
			{{
				\"candidate_feature_combo\": [[feature1_in_combination,source_dataset_of_feature1],[feature2_in_combination,source_dataset_of_feature2],etc for as many features as are needed for the combo],
				\"reasoning\": explanation as to why you think it is a candidate,
				\"correlation\": correlated/uncorrelated/anticorrelated
			}},
			...
		]
		Make sure to return only the uglified JSON.
	"""
	return prompt


def render_request_from_tables_dependencies(
	dataset_description : str,
	columns_dependency  : str
) -> str:
	prompt = f"""
		I have a dataset. Here is the description of the dataset: {sanitize(dataset_description)}.
		I have identified the following dependencies between columns.
		Here is the dependency : {columns_dependency}.
		I want to see all the lines that do not comply with the givent correlation.
		Write me a SQL query, in the AWS Redshift variant of SQL, that will highlight the potential problems in the problem.
		Make sure to write only the SQL query.
	"""
	return prompt

def parse_agent3_output(agent3_output : str) -> List:
	return json.loads(agent3_output)


def main():
	# bedrock         = boto3.client(service_name="bedrock",         region_name='us-west-2')
	bedrock_runtime = boto3.client(service_name = "bedrock-runtime", region_name='us-west-2')

	# Agent 1: get table metadata
	agent1_outputs  = []
	for csv, desc in DEFAULT_CSVS.items():
		metadata_prompt = render_from_df__human_prompt_metadata_describer(
			df                  = pd.read_csv(csv),
			df_text_description = desc,
		)
		description_agent_prompt = combine_prompts(
			system_prompt_metadata_describer,
			metadata_prompt,
		)
		print(f"{description_agent_prompt}")
		agent1_output = run_claude_prompt(
			bedrock_runtime = bedrock_runtime,
			prompt          = description_agent_prompt,
		)
		print(f"{agent1_output}")
		agent1_outputs.append(agent1_output)

	# # Agent 2: get table join candidates
	# agent2_inputs = {
	# 	filename: agent1_output
	# 	for filename, agent1_output in zip(DEFAULT_CSVS, agent1_outputs)
	# }
	# tabling_prompt = render_from_metadata__human_prompt_table_joiner(
	# 	tables_metadata = agent2_inputs,
	# )
	# tablejoiner_agent_prompt = combine_prompts(
	# 	system_prompt_table_joiner,
	# 	tabling_prompt,
	# )
	# print(f"\n\n{tablejoiner_agent_prompt=}")
	# agent2_output = run_claude_prompt(
	# 	bedrock_runtime = bedrock_runtime,
	# 	prompt          = tablejoiner_agent_prompt,
	# )
	# print(f"\n\n{agent2_output=}")

	# Agent 3: get columns dependencies candidates
	agent1_output_folded = ",".join(agent1_outputs)
	combo_columns_prompt = render_columns_dependencies_prompts(agent1_output_folded)
	agent3_input = combine_prompts(
		system_prompt_verif_feature_elicitation,
		combo_columns_prompt,
	)
	print(f"\n\n{agent3_input=}")
	agent3_output = run_claude_prompt(
		bedrock_runtime = bedrock_runtime,
		prompt          = agent3_input,
	)


	# Agent 4: get SQL queries
	print(f"\n\n{agent3_output=}")
	agent3_output_fixed = extract_by_symbol(agent3_output, ('[',']'))
	print(f"\n\n{agent3_output_fixed=}")
	# agent3_output_fixed = run_claude_prompt(
	# 	bedrock_runtime = bedrock_runtime,
	# 	prompt          = "This JSON is invalid, please fix it: " + agent3_output_fixed,
	# )
	result = []
	parsed_agent3_output = parse_agent3_output(agent3_output_fixed)
	for dependency in parsed_agent3_output:
		print(f"\n\n{dependency=}")
		agent_sql_prompt = render_request_from_tables_dependencies(agent1_output, dependency)
		agent4_input = combine_prompts(
			system_prompt_sql_request,
			agent_sql_prompt,
		)
		print(f"\n\n{agent4_input=}")
		sql_query = run_claude_prompt(
			bedrock_runtime = bedrock_runtime,
			prompt          = agent4_input,
		)
		if '```' in sql_query:
			sql_query = extract_by_symbol(sql_query, ('```','```'))
		result.append(sql_query)
	
	return result


if __name__ == "__main__":
	results = main()
	print(f"SQL results:\n")
	for sql_query in results:
		print(f"{sql_query}\n\n")
