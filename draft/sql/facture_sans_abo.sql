-- factures sans abonnements
SELECT 
    c.CLE_PDS,
    c.MOIS_CONSO,
    c.VOLUME_MOIS,
    c.DATE_CONSO_MOIS,
    a.DATE_EMISSION_FACTURE
FROM 
    conso AS c
INNER JOIN 
    (SELECT * FROM factures_pds WHERE cle_abonnement != "CLE_ABONNEMENT") AS a 
    ON c.CLE_PDS = a.CLE_PDS
    AND (
        c.MOIS_CONSO = extract(month FROM a.DATE_EMISSION_FACTURE)
        AND c.annee_conso = extract(year FROM a.DATE_EMISSION_FACTURE)
    )
WHERE 
    a.CLE_ABONNEMENT IS NULL;
