type Props = {
    guess: string;
    setGuess: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    canSubmit: boolean;
    disabled: boolean;
    submitting: boolean;
};

export default function GuessInput({
    guess,
    setGuess,
    onSubmit,
    canSubmit,
    disabled,
    submitting,
}: Props) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-md">
            <input
                type="text"
                inputMode="numeric"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter 4 digits (0–7)"
                disabled={disabled}
                className="text-center text-4xl font-mono tracking-widest py-4 px-6 rounded-xl bg-gray-100 text-black placeholder:text-2xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={!canSubmit}
                className="h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {submitting ? 'Checking…' : 'Submit'}
            </button>
        </form>
    );
}
