import { Play, Loader2 } from 'lucide-react';

interface ExecuteButtonProps {
    onClick: () => void;
    loading: boolean;
}

function ExecuteButton({ onClick, loading }: ExecuteButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-white bg-[#EE2737] hover:bg-red-700 rounded transition-colors border border-[#EE2737] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <Play className="w-3.5 h-3.5" />
            )}
            <span className="text-xs">Execute</span>
        </button>
    );
}

export default ExecuteButton; 