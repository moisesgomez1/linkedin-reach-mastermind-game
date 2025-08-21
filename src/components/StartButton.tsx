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
      className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg shadow-md
                 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
    >
      {loading ? "Starting..." : "Start New Game"}
    </button>
  );
}
