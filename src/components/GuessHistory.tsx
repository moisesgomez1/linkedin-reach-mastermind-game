type GuessRecord = {
    id: string;
    guess: number[];
    correctNumbers: number;
    correctPositions: number;
};

type Props = {
    history?: GuessRecord[];
};

export default function GuessHistory({ history = [] }: Props) {
    if (history.length === 0) return null;

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-4">Guess History</h2>
            <ul className="space-y-3">
                {history.map((entry, idx) => (
                    <li
                        key={entry.id || idx}
                        className="p-4 bg-gray-800 rounded-lg shadow border border-gray-700"
                    >
                        <div className="font-mono text-lg tracking-widest text-white">
                            {entry.guess.join(' ')}
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                            <span className="text-green-400">🎯 {entry.correctPositions} Correct Location</span>
                            <span className="text-cyan-400">🔢 {entry.correctNumbers} Correct Number</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
