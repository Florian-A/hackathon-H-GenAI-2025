import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { Control } from '../types';
import ResultDisplay from '../components/ResultDisplay';
import SqlQueryCell from '../components/SqlQueryCell';
import ExecuteButton from '../components/ExecuteButton';
import RefineModal from '../components/RefineModal';
import RefineButton from '../components/RefineButton';

const API_URL = import.meta.env.DEV
  ? '/api/controls'
  : process.env.CONTROLS_API_URL;

const SQL_EXEC_API_URL = import.meta.env.DEV
  ? '/api/sql-exec'
  : process.env.SQL_EXEC_API_URL;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export default function Resultats() {
  const [controls, setControls] = useState<Control[]>([]);
  const [editedQueries, setEditedQueries] = useState<{ [key: number]: string }>({});
  const [results, setResults] = useState<{ [key: number]: any }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState<number | null>(null);

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const data = await fetchWithRetry();
        setControls(data);
        const initialQueries = data.reduce((acc: any, control: Control) => {
          acc[control.id] = control.control_sql;
          return acc;
        }, {});
        setEditedQueries(initialQueries);
      } catch (err) {
        setError('Erreur lors du chargement des contrôles');
      }
    };

    fetchControls();
  }, []);

  const fetchWithRetry = async (retries: number = 0): Promise<Control[]> => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (err) {
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(retries + 1);
      }
      throw err;
    }
  };

  const executeQuery = async (controlId: number) => {
    setLoading(prev => ({ ...prev, [controlId]: true }));
    try {
      const response = await axios.post(SQL_EXEC_API_URL, {
        id: controlId,
        query: editedQueries[controlId]
      });
      setResults(prev => ({
        ...prev,
        [controlId]: { success: true, message: "Requête exécutée avec succès", data: response.data }
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'exécution";
      setResults(prev => ({
        ...prev,
        [controlId]: { success: false, message: errorMessage }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [controlId]: false }));
    }
  };

  const handleRefine = (prompt: string) => {
    if (!selectedQueryId) return;
    console.log(`Refining query ${selectedQueryId} with prompt: ${prompt}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full border-2 border-[#EE2737]">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 flex flex-col">
      <div className="flex flex-col flex-grow">
        <h1 className="text-2xl font-bold text-black mb-4">Liste des requêtes SQL</h1>

        <div className="bg-white rounded-lg shadow-md border-2 border-[#EE2737] flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px]">
              <thead className="sticky top-0 bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black w-48">Fonction</th>
                  <th className="px-4 py 2 text-left text-sm font-semibold text-black w-48">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black w-[50%] min-w-[700px]">Requête SQL</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-black w-16">Actions</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black w-[60%] min-w-[600px]">Résultats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {controls.map(control => (
                  <tr
                    key={control.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-all duration-200 ${selectedRow === control.id ? 'bg-gray-50' : ''}`}
                    onClick={() => setSelectedRow(selectedRow === control.id ? null : control.id)}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-black truncate">
                      {control.control_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 break-words">
                      <div className="max-w-[25rem]" title={control.control_description}>
                        {control.control_description}
                      </div>
                    </td>
                    <td className={`px-4 py-2 w-[25%] transition-all duration-200 ${selectedRow === control.id ? 'py-4' : ''}`}>
                      <SqlQueryCell
                        value={editedQueries[control.id]}
                        onChange={(value) => setEditedQueries(prev => ({
                          ...prev,
                          [control.id]: value
                        }))}
                        expanded={selectedRow === control.id}
                      />
                    </td>
                    <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                      <div className="space-y-2">
                        <ExecuteButton
                          onClick={() => executeQuery(control.id)}
                          loading={loading[control.id]}
                        />
                        <RefineButton
                          onClick={() => {
                            setSelectedQueryId(control.id);
                            setIsRefineModalOpen(true);
                          }}
                        />
                      </div>
                    </td>
                    <td className={`px-4 py-2 transition-all duration-200 ${selectedRow === control.id ? 'py-4' : ''}`}>
                      {results[control.id] && (
                        <ResultDisplay
                          data={results[control.id].data}
                          success={results[control.id].success}
                          message={results[control.id].message}
                          expanded={selectedRow === control.id}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RefineModal
        isOpen={isRefineModalOpen}
        onClose={() => {
          setIsRefineModalOpen(false);
          setSelectedQueryId(null);
        }}
        onSubmit={handleRefine}
      />
    </div>
  );
}