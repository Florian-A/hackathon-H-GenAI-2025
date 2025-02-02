 INSERT INTO veolia.pipeline_output (control_name, control_description, control_tables, control_sql, control_result) VALUES
('Check User Count', 'Vérifie si le nombre d’utilisateurs actifs est supérieur à 1000', 'users', 'SELECT COUNT(*) FROM users WHERE active = 1', 1),
('Check Order Total', 'Valide que le total des commandes est positif', 'orders', 'SELECT SUM(amount) FROM orders', 1),
('Check Null Emails', 'Détecte la présence d’emails NULL dans la table clients', 'customers', 'SELECT COUNT(*) FROM customers WHERE email IS NULL', 0),
('Check Duplicate Entries', 'Recherche des doublons dans la table des transactions', 'transactions', 'SELECT transaction_id, COUNT(*) FROM transactions GROUP BY transaction_id HAVING COUNT(*) > 1', 0),
('Check Sales Data', 'Vérifie si les ventes du jour sont enregistrées', 'sales', 'SELECT COUNT(*) FROM sales WHERE sale_date = CURDATE()', 1);