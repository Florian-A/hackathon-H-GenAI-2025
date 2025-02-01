import { Play } from 'lucide-react';

interface ExecuteButtonProps {
    onClick: () => void;
    loading: boolean;
}

function ExecuteButton({ onClick, loading }: ExecuteButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 w-full justify-center"
        >
            <Play className="w-4 h-4" />
            {loading ? 'Exécution...' : 'Exécuter'}
        </button>
    );
}

export default ExecuteButton; 