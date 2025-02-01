import { useState, useEffect } from 'react';
import axios from 'axios';
import TableStructure from '../components/TableStructure';

interface TableColumn {
    Field: string;
    Type: string;
}

interface TableData {
    [tableName: string]: TableColumn[];
}

function Home() {
    const [tables, setTables] = useState<TableData>({});
    const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
    const [displayedTable, setDisplayedTable] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get('/api/structure');
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

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Chargement des tables...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;
    }

    return (
        <div className="bg-white h-full">
            <div className="max-w-7xl mx-auto px-4 flex gap-6">
                {/* Liste des tables (gauche) */}
                <div className="w-1/3 border-r border-gray-200 pr-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-black">Tables disponibles</h2>
                        <button
                            onClick={toggleAll}
                            className="text-sm text-[#EE2737] hover:underline"
                        >
                            {selectedTables.size === Object.keys(tables).length ? 'Désélectionner tout' : 'Sélectionner tout'}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {Object.keys(tables).map((tableName) => (
                            <div key={tableName} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group">
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
                </div>

                {/* Structure de la table (droite) */}
                <div className="flex-1">
                    {displayedTable ? (
                        <TableStructure
                            tableName={displayedTable}
                            columns={tables[displayedTable]}
                        />
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