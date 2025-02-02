-- Conso sans abonnements
SELECT 
    c.CLE_PDS,
    c.MOIS_CONSO,
    c.VOLUME_MOIS,
    c.DATE_CONSO_MOIS,
    a.DATE_ENTREE_LOCAL_ABONNEMENT,
    a.DATE_SOUSCRIPTION_ABONNEMENT,
    a.DATE_RESILIATION_ABONNEMENT
FROM 
    conso AS c
INNER JOIN 
    (SELECT * FROM abonnements_pds WHERE cle_abonnement != 'CLE_ABONNEMENT') AS a 
    ON c.CLE_PDS = a.CLE_PDS
    AND (
        c.DATE_CONSO_MOIS BETWEEN 
        CAST(a.date_entree_local_abonnement AS DATE) 
        AND COALESCE(CAST(a.DATE_RESILIATION_ABONNEMENT AS DATE), CURRENT_DATE)
    )
WHERE 
    a.CLE_ABONNEMENT IS NULL;
