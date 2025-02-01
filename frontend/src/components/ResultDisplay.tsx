interface ResultDisplayProps {
    data: any;
    success: boolean;
    message: string;
}

function ResultDisplay({ data, success, message }: ResultDisplayProps) {
    if (!data && !message) return null;

    return (
        <div className="space-y-2">
            <div className={`text-sm ${success ? 'text-green-600' : 'text-red-600'}`}>
                {message}
            </div>
            {data && (
                <div className="max-h-40 overflow-auto bg-gray-50 p-2 rounded border border-gray-200">
                    <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default ResultDisplay; 