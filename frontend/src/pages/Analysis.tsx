import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ColumnDescription {
  name: string;
  description: string;
  table: string;
}

export default function Analysis() {
  const [columns, setColumns] = useState<ColumnDescription[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [userPrompt, setUserPrompt] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedAnalysis = localStorage.getItem('columnAnalysis');
    if (!storedAnalysis) {
      navigate('/');
      return;
    }
    setColumns(JSON.parse(storedAnalysis));
  }, [navigate]);

  const handleRefine = () => {
    if (selectedColumns.size === 0) return;

    const selectedData = columns.filter(col =>
      selectedColumns.has(`${col.table}.${col.name}`)
    );

    localStorage.setItem('refinedAnalysis', JSON.stringify({
      columns: selectedData,
      prompt: userPrompt
    }));

    navigate('/resultats');
  };

  const toggleColumn = (table: string, name: string) => {
    const key = `${table}.${name}`;
    const newSelection = new Set(selectedColumns);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    setSelectedColumns(newSelection);
  };

  const toggleAll = () => {
    if (selectedColumns.size === columns.length) {
      setSelectedColumns(new Set());
    } else {
      const allKeys = columns.map(col => `${col.table}.${col.name}`);
      setSelectedColumns(new Set(allKeys));
    }
  };

  return (
    <div className="bg-white p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-black">Analyse des données</h1>
        </div>

        <div className="mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Décrivez votre besoin
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#EE2737] focus:border-[#EE2737]"
              rows={2}
              placeholder="Ex: Je veux analyser la consommation moyenne par région..."
            />
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={handleRefine}
              disabled={selectedColumns.size === 0 || !userPrompt.trim()}
              className={`px-6 py-2 rounded-md transition-colors ${selectedColumns.size === 0 || !userPrompt.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#EE2737] text-white hover:bg-red-700'
                }`}
            >
              Générer les requêtes
            </button>
          </div>
        </div>

        <div className="h-[60vh] flex flex-col bg-white rounded-lg shadow-md border-2 border-[#EE2737]">
          <div className="p-2 border-b border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedColumns.size} colonne{selectedColumns.size > 1 ? 's' : ''} sélectionnée{selectedColumns.size > 1 ? 's' : ''}
            </div>
            <button
              onClick={toggleAll}
              className="text-sm text-[#EE2737] hover:underline"
            >
              {selectedColumns.size === columns.length ? 'Désélectionner tout' : 'Sélectionner tout'}
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-2"></th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Table</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Colonne</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {columns.map((column, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedColumns.has(`${column.table}.${column.name}`)}
                        onChange={() => toggleColumn(column.table, column.name)}
                        className="w-4 h-4 text-[#EE2737] border-gray-300 rounded focus:ring-[#EE2737]"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-black">{column.table}</td>
                    <td className="px-4 py-2 text-sm text-black">{column.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 whitespace-pre-wrap">{column.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 