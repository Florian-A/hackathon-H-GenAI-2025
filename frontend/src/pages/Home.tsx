import { useState, useEffect } from 'react';
import axios from 'axios';
import TableStructure from '../components/TableStructure';
import { useNavigate } from 'react-router-dom';

interface TableColumn {
  Field: string;
  Type: string;
}

interface TableData {
  [tableName: string]: TableColumn[];
}

interface ColumnDescription {
  name: string;
  description: string;
  table: string;
}

function Home() {
  const [tables, setTables] = useState<TableData>({});
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [displayedTable, setDisplayedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ColumnDescription[]>([]);
  const navigate = useNavigate();

  const columnDescriptions: { [key: string]: { [key: string]: string } } = {
    veolia_data_factures: {
      CLE_ABONNEMENT: "Identifiant de l'abonné",
      CLE_FACTURE: "Identifiant de la facture. Plusieurs factures peuvent être associées à un même abonné.",
      DATE_EMISSION_FACTURE: "Date d'émission de la facture",
      CONSO_FACTURE: "La consommation qui apparaît dans la facture, qui est facturé au consommateur",
      DATE_RELEVE_INDEX_PRECEDENT_FACTURE_COMPOSITE: "La consommation d'une facture se calcule par la différence d'un index. L'index \"d'aujourd'hui\" moins l'index \"d'hier\". Ici il s'agit de la date de relevé de l'index le plus ancien ayant servi au calcul de la consommation.",
      DATE_RELEVE_INDEX_FACTURE: "Date de relevé de l'index le plus récent ayant servi au calcul de la consommation.",
      NB_FACTURES_PAR_PDS: "Le nombre de factures par point de service.",
      NB_JOURS_CONNUS: "Le nombre de jours connus sur la facture (correspond normalement à la date de relevé index facture moins la date de relevé de l'index précédent)",
      NUM_FAC_PAR_PDS: "L'ordre de la facture par point de service (1ère facture, 2ème facture, ...)"
    },
    veolia_data_consos: {
      CLE_PDS: "L'identifiant du point de livraison. Le PDS se trouve dans l'identifiant abonnement. L'identifiant abonnement est composé de la manière suivante : \"CLE_PDS\" + ordre de l'abonné sur le point de service (par exemple \"01\", \"02\", ...). Un abonné peut effectivement changer sur un point de livraison.",
      LIBELLE_REGION: "La région d'appartenance au point de livraison",
      LIBELLE_TERRITOIRE: "Le territoire d'appartenance au point de livraison",
      CODE_CONTRAT: "Le code du contrat de délégation de service public auquel est associé le point de livraison",
      LIBELLE_CATEGORIE_ABONNE: "La catégorie de l'abonné (bâtiment collectif public / privé, industriel, professionnel, ...)",
      DIAMETRE_NOMINAL: "Le diamètre nominal du compteur (plus le compteur est gros, plus la consommation doit être élevé)",
      TYPE_ABAQUE: "Le type de méthode qui nous a permis de calculer la consommation (est-on sur du ML, sur du télérelevé, ...)",
      MOIS_CONSO: "Le mois concerné par la consommation",
      ANNEE_CONSO: "L'année de la consommation",
      DATE_CONSO_MOIS: "La date liée à la consommation",
      VOLUME_MOIS: "Le volume consommé sur le mois / année en question"
    },
    veolia_data_abonnements: {
      CLE_ABONNEMENT: "L'identifiant de l'abonnement",
      DATE_ENTREE_ABONNEMENT: "La date d'entrée de l'abonné dans le logement",
      DATE_SOUSCRIPTION_ABONNEMENT: "La date à laquelle l'abonné a souscrit un abonnement",
      DATE_RESILIATION_ABONNEMENT: "La date de résiliation de l'abonné. Quand l'abonné est hors d'une période active (entre souscription et résiliation), il ne doit pas y avoir deconsommations."
    }
  };

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const apiUrl = import.meta.env.DEV
          ? '/api/structure'
          : process.env.STRUCTURE_API_URL;
        const response = await axios.get(apiUrl);
        setTables(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des tables');
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const toggleTable = (tableName: string) => {
    const newSelection = new Set(selectedTables);
    if (newSelection.has(tableName)) {
      newSelection.delete(tableName);
    } else {
      newSelection.add(tableName);
    }
    setSelectedTables(newSelection);
  };

  const toggleAll = () => {
    if (selectedTables.size === Object.keys(tables).length) {
      setSelectedTables(new Set());
    } else {
      setSelectedTables(new Set(Object.keys(tables)));
    }
  };

  const analyzeSelectedTables = () => {
    if (selectedTables.size === 0) return;
    setAnalyzing(true);

    const selectedColumns: ColumnDescription[] = Array.from(selectedTables).flatMap(tableName => {
      const tableColumns = tables[tableName];
      return tableColumns.map(column => ({
        name: column.Field,
        description: columnDescriptions[tableName]?.[column.Field] || "Description non disponible",
        table: tableName
      }));
    });

    localStorage.setItem('columnAnalysis', JSON.stringify(selectedColumns));
    navigate('/analysis');
    setAnalyzing(false);
  };

  if (loading)
    return <div className="flex items-center justify-center h-screen">Chargement des tables...</div>;

  if (error)
    return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;

  return (
    <div className="bg-white h-full">
      <div className="max-w-full h-[90vh] flex">
        {/* Liste des tables (gauche) */}
        <div className="w-96 border-r border-gray-200 py-6 px-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">Tables disponibles</h2>
            <button
              onClick={toggleAll}
              className="text-sm text-[#EE2737] hover:underline"
            >
              {selectedTables.size === Object.keys(tables).length ? 'Désélectionner tout' : 'Sélectionner tout'}
            </button>
          </div>


          <div className="p-2 flex-1 overflow-auto">
            {Object.keys(tables).map((tableName) => (
              <div key={tableName} className="flex items-center gap-3 hover:bg-gray-50 rounded group">
                <input
                  type="checkbox"
                  checked={selectedTables.has(tableName)}
                  onChange={() => toggleTable(tableName)}
                  className="w-4 h-4 text-[#EE2737] border-gray-300 rounded focus:ring-[#EE2737]"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setDisplayedTable(tableName)}
                  className={`flex-1 text-left py-1 ${displayedTable === tableName
                    ? 'text-[#EE2737] font-medium'
                    : 'text-black group-hover:text-[#EE2737]'
                    }`}
                >
                  {tableName}
                </button>
              </div>
            ))}
          </div>

          {/* Bouton Analyser */}
          <div className="">
            <button
              onClick={analyzeSelectedTables}
              disabled={selectedTables.size === 0 || analyzing}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors ${selectedTables.size === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#EE2737] text-white hover:bg-red-700'
                }`}
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <span>Analyser {selectedTables.size} table{selectedTables.size > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structure de la table (droite) */}
        <div className="flex-1 p-4 overflow-auto">
          {displayedTable ? (
            <TableStructure
              tableName={displayedTable}
              columns={tables[displayedTable]}
            />
          ) : analysisResults.length > 0 ? (
            <div className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Analyse des colonnes</h2>
                <button
                  onClick={() => setAnalysisResults([])}
                  className="text-sm text-[#EE2737] hover:underline"
                >
                  Fermer
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md border-2 border-[#EE2737]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-black w-48">Table</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-black min-w-[200px] w-48">Colonne</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-black min-w-[400px]">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analysisResults.map((column, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-black truncate">
                            {column.table}
                          </td>
                          <td className="px-4 py-2 text-sm text-black truncate">
                            {column.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 whitespace-pre-wrap">
                            {column.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Cliquez sur une table pour afficher sa structure
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home; 