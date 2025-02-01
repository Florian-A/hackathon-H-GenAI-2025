interface TableColumn {
    Field: string;
    Type: string;
}

interface TableStructureProps {
    tableName: string;
    columns: TableColumn[];
}

function TableStructure({ tableName, columns }: TableStructureProps) {
    return (
        <div className="bg-white shadow-sm rounded-lg p-4 border-2 border-[#EE2737]">
            <h2 className="text-lg font-bold text-black mb-2">
                {tableName}
            </h2>
            <div className="overflow-auto">
                <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                        <tr className="bg-gray-50">
                            <th className="text-left py-2 px-4 font-medium text-black">Colonne</th>
                            <th className="text-left py-2 px-4 font-medium text-black">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {columns.map((column) => (
                            <tr key={column.Field} className="border-t border-gray-100">
                                <td className="py-1 px-4 font-medium">{column.Field}</td>
                                <td className="py-1 px-4 text-gray-600">{column.Type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TableStructure; 