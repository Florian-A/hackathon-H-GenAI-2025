# Interface de Gestion des Données Veolia

Cette application web permet de visualiser et d'analyser les données des tables Veolia. Elle offre une interface intuitive pour explorer la structure des tables et exécuter des requêtes SQL personnalisées.

## Site déployé

https://main.d19w83t957c0c1.amplifyapp.com/

## Fonctionnalités

### 1. Exploration des Tables
- Visualisation de la liste des tables disponibles
- Sélection multiple de tables
- Affichage détaillé de la structure de chaque table
- Analyse des colonnes avec leurs descriptions

### 2. Requêtes SQL
- Interface dédiée pour l'exécution de requêtes SQL
- Édition de requêtes avec prévisualisation
- Affichage des résultats en temps réel
- Gestion des erreurs d'exécution

## Technologies Utilisées

- **Frontend**
  - React
  - TypeScript
  - Tailwind CSS
  - Axios pour les requêtes HTTP
  - React Router pour la navigation
  - Vite comme bundler

- **Backend**
  - AWS Lambda + Python 3.13
  - AWS Redshift
  - AWS Amplify
  - Au choix Mixtral 8x7B ou Claude Sonnet 3.5 pour les agents prompteurs

## Structure du Projet 

- `draft/` : Contient les expérimentations initiales de l'application
  - `prompting/` : un logiciel python qui nous a servi de base pour construire nos agents prompteurs et travailler la qualité de notre pipeline de *prompt chaining* (mise dans des lambdas AWS par la suite)
  - `sql/` : différentes commandes SQL utilisées pour comprendre le dataset et évaluer la pertinence des prompts produits par nos agents
- `frontend/` : contient la webapp qui sert d'interface frontend à l'application, et ce que les expert data voient. C'est une app Vite + React + TS.
- `infra/` : contient uniquement:
  - `step_function.json`: le fichier de configuration de notre pipeline sur AWS
  - `template.yaml`: permet de déployer Bedrock, Redshift et Amplify
- `lambdas/` : le dossier contenant le code de nos différentes lambdas; pour chacune, on a un fichier `.yaml` permettant de la déployer.
  - `frontEndEndpoint/` : monolithe pour faire tourner certains agents prompteurs
  - `execSQLData/` : exécute une requête SQL générée
  - `getAllColumn/` : renvoie l'ensemble des noms de colonnes pour le front
  - `getAllPipelineOutput/` : renvoie les requêtes SQL générées et des tests à faire
  - `getDescribeAllTable/` : renvoie la structure des tables pour l'affichage
  - `humanLoop/` : permet d'itérer sur une requêtes SQL pour la raffiner 
  - `nonNullControl/` : permet de vérifier s'il y a des nulls dans une feature spécifique
 
## Architectre Fonctionelle

![AWS drawio](https://github.com/user-attachments/assets/ef1eb050-811a-4642-9326-a07fc1c9bbc7)


