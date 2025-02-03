interface SqlQueryCellProps {
    value: string;
    onChange: (value: string) => void;
    expanded?: boolean;
}

function SqlQueryCell({ value, onChange, expanded = false }: SqlQueryCellProps) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full p-2 border border-gray-300 rounded text-sm font-mono transition-all duration-200 ${
                expanded ? 'h-32' : 'h-16'
            }`}
            rows={expanded ? 6 : 2}
        />
    );
}

export default SqlQueryCell;