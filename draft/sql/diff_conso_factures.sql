-- Diff conso/factures
WITH diff_table AS (
SELECT conso.cle_pds, conso.MOIS_CONSO, conso.annee_conso, ABS(SUM(CONSO_FACTURE) - SUM(VOLUME_MOIS)) AS diff 
FROM factures_pds
INNER JOIN conso
ON conso.cle_pds = factures_pds.cle_pds
AND conso.MOIS_CONSO  = extract(month FROM DATE_EMISSION_FACTURE)
AND conso.annee_conso = extract(year FROM DATE_EMISSION_FACTURE) 
GROUP BY 1, 2, 3
)
SELECT *
FROM diff_table
WHERE diff = 0