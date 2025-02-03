interface ResultDisplayProps {
    data: any;
    success: boolean;
    message: string;
    expanded?: boolean;
}

function ResultDisplay({ data, success, message, expanded = false }: ResultDisplayProps) {
    if (!data && !message) return null;

    return (
        <div className="space-y-2 max-w-[600px]">
            <div className={`text-sm ${success ? 'text-green-600' : 'text-red-600'}`}>
                {message}
            </div>
            {data && (
                <div className={`overflow-auto bg-gray-50 p-2 rounded border border-gray-200 transition-all duration-200 ${expanded ? 'max-h-80' : 'max-h-40'}`}>
                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default ResultDisplay;