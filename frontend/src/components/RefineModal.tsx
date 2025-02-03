import React, { useState } from 'react';

interface RefineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (prompt: string) => void;
}

export default function RefineModal({ isOpen, onClose, onSubmit }: RefineModalProps) {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(prompt);
        setPrompt('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-black">Régénérer la requête</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#EE2737] focus:border-[#EE2737] mb-4"
                        rows={3}
                        placeholder="Décrivez comment vous souhaitez affiner la requête..."
                        autoFocus
                    />

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300"
                            disabled={!prompt.trim()}
                        >
                            Régénérer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}