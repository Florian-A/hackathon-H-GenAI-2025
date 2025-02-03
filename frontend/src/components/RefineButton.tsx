import { Wand2 } from 'lucide-react';

interface RefineButtonProps {
    onClick: () => void;
}

function RefineButton({ onClick }: RefineButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-[#EE2737] bg-white hover:bg-red-50 rounded transition-colors border border-[#EE2737]"
        >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="text-xs">Régénérer</span>
        </button>
    );
}

export default RefineButton;