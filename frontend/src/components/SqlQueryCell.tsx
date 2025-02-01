interface SqlQueryCellProps {
    value: string;
    onChange: (value: string) => void;
}

function SqlQueryCell({ value, onChange }: SqlQueryCellProps) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm font-mono"
            rows={2}
        />
    );
}

export default SqlQueryCell; 