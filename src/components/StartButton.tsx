type StartButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
};

export default function StartButton({ onClick, disabled, loading }: StartButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="h-12 px-6 rounded-2xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-50"
        >
            {loading ? 'Starting...' : 'Start New Game'}
        </button>
    );
}
