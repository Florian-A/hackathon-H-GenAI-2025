# Interface de Gestion des Données Veolia

Cette application web permet de visualiser et d'analyser les données des tables Veolia. Elle offre une interface intuitive pour explorer la structure des tables et exécuter des requêtes SQL personnalisées.

---

## 🚀 Site Déployé

🔗 [Accéder à l'application](https://main.d19w83t957c0c1.amplifyapp.com/)

---

## 📌 Fonctionnalités

### 🔍 Exploration des Tables
- Visualisation de la liste des tables disponibles
- Sélection multiple de tables
- Affichage détaillé de la structure de chaque table
- Analyse des colonnes avec leurs descriptions

### 📝 Requêtes SQL
- Interface dédiée pour l'exécution de requêtes SQL
- Édition de requêtes avec prévisualisation
- Affichage des résultats en temps réel
- Gestion des erreurs d'exécution

---

## 🛠️ Technologies Utilisées

### **Frontend**
- React
- TypeScript
- Tailwind CSS
- Axios (requêtes HTTP)
- React Router (navigation)
- Vite (bundler)

### **Backend**
- AWS Lambda + Python 3.13
- AWS Redshift
- AWS Amplify
- Agents prompteurs : Mixtral 8x7B ou Claude Sonnet 3.5

---

## 📂 Structure du Projet

```
draft/          # Expérimentations initiales de l'application
│── prompting/  # Base des agents prompteurs et pipeline de *prompt chaining*
│── sql/        # Commandes SQL pour analyser le dataset et évaluer les prompts

frontend/       # Webapp (Vite + React + TypeScript)

infra/          # Fichiers de configuration pour l'infrastructure AWS
│── step_function.json  # Configuration du pipeline AWS
│── template.yaml       # Déploiement de Bedrock, Redshift et Amplify

lambdas/        # Code des différentes fonctions AWS Lambda
│── frontEndEndpoint/       # Monolithe pour exécuter certains agents prompteurs
│── execSQLData/           # Exécution des requêtes SQL générées
│── getAllColumn/          # Récupération des noms de colonnes pour le frontend
│── getAllPipelineOutput/  # Renvoi des requêtes SQL générées et tests associés
│── getDescribeAllTable/   # Récupération de la structure des tables
│── humanLoop/             # Itération sur les requêtes SQL pour affinement
│── nonNullControl/        # Vérification des valeurs nulles dans une feature
```

---

## 🏗️ Architecture Fonctionnelle

![AWS drawio](https://github.com/user-attachments/assets/ef1eb050-811a-4642-9326-a07fc1c9bbc7)

---

## 🎥 Démonstration

![Demo](./img/video1.gif)

