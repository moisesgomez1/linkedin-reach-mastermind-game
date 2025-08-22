type GuessRecord = {
    id: string;
    guess: number[];
    correctNumbers: number;
    correctPositions: number;
};

type GuessHistoryProps = {
    history: GuessRecord[];
};

export default function GuessHistory({ history }: GuessHistoryProps) {
    if (history.length === 0) return null;

    return (
        <div className="mt-10">
            <h2 className="text-xl font-bold text-slate-700 mb-4 text-center">Guess History</h2>
            <ul className="space-y-3">
                {history.map((entry, index) => (
                    <li
                        key={entry.id || index}
                        className="rounded-2xl bg-slate-100 border border-slate-300 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-slate-600 text-sm">Guess:</span>
                            <span className="text-slate-900 text-lg font-mono font-bold tracking-widest">
                                {entry.guess.join(' ')}
                            </span>
                        </div>
                        <div className="flex gap-4 mt-2 sm:mt-0">
                            <span className="text-green-600 font-semibold">
                                🎯 {entry.correctPositions} correct position
                            </span>
                            <span className="text-cyan-600 font-semibold">
                                🔢 {entry.correctNumbers} correct number
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
