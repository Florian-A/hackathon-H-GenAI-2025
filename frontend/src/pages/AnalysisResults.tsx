import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ColumnDescription {
  name: string;
  description: string;
  table: string;
}

export default function AnalysisResults() {
  const [columns, setColumns] = useState<ColumnDescription[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAnalysis = localStorage.getItem('columnAnalysis');
    if (!storedAnalysis) {
      navigate('/');
      return;
    }
    setColumns(JSON.parse(storedAnalysis));
  }, [navigate]);

  return (
    <div className="bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Analyse des colonnes</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm text-[#EE2737] hover:underline"
          >
            Retour
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border-2 border-[#EE2737]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Table</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Colonne</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {columns.map((column, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-black">{column.table}</td>
                    <td className="px-4 py-2 text-sm text-black">{column.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{column.description}</td>
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