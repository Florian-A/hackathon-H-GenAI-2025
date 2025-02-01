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
            className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors disabled:opacity-50 w-full justify-center"
        >
            <Play className="w-3 h-3" />
            {loading ? 'Exécution...' : 'Exécuter'}
        </button>
    );
}

export default ExecuteButton; 