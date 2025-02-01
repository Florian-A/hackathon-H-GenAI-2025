import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, AlertCircle } from 'lucide-react';
import { Control } from '../types';

const API_URL = process.env.API_BASE_URL || '';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

function Page3() {
  const [controls, setControls] = useState<Control[]>([]);
  const [editedQueries, setEditedQueries] = useState<{ [key: number]: string }>({});
  const [results, setResults] = useState<{ [key: number]: any }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const fetchWithRetry = async (retries: number = 0): Promise<Control[]> => {
    try {
      const url = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(retries + 1);
      }
      throw err;
    }
  };

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
        const errorMessage = err instanceof Error 
          ? `Erreur de connexion: ${err.message}` 
          : "Erreur lors du chargement des contrôles. Veuillez vérifier votre connexion et réessayer.";
        setError(errorMessage);
        if (axios.isAxiosError(err)) {
          console.error('Error fetching controls:', {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText
          });
        } else {
          console.error('Error fetching controls:', errorMessage);
        }
      }
    };

    fetchControls();
  }, []);

  const handleQueryChange = (controlId: number, value: string) => {
    setEditedQueries(prev => ({
      ...prev,
      [controlId]: value
    }));
  };

  const executeQuery = async (controlId: number) => {
    setLoading(prev => ({ ...prev, [controlId]: true }));
    try {
      const url = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
      const response = await axios.post(url, {
        id: controlId,
        sql: editedQueries[controlId]
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contrôles SQL</h1>
        
        <div className="space-y-6">
          {controls.map(control => (
            <div key={control.id} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {control.control_name}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {control.control_description}
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requête SQL
                </label>
                <textarea
                  value={editedQueries[control.id]}
                  onChange={(e) => handleQueryChange(control.id, e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => executeQuery(control.id)}
                  disabled={loading[control.id]}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  {loading[control.id] ? 'Exécution...' : 'Exécuter'}
                </button>
                
                {results[control.id] && (
                  <div className={`text-sm ${results[control.id].success ? 'text-green-600' : 'text-red-600'}`}>
                    {results[control.id].message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Page3;