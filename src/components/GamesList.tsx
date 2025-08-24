type GameSummary = {
    id: string;
    attemptsLeft: number;
    isWin: boolean;
    isOver: boolean;
    mode: 'classic' | 'timed';
    startTime: string | null;
    timeLimit: number | null;
    createdAt: string;
    updatedAt: string;
};

type GameListProps = {
    games: GameSummary[];
    onSelect?: (id: string) => void;
};

export default function GameList({ games, onSelect }: GameListProps) {
    if (games.length === 0) {
        return (
            <div className="mt-6 text-center text-slate-500">No games yet. Start a new one!</div>
        );
    }

    return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((g) => (
                <button
                    key={g.id}
                    onClick={() => onSelect?.(g.id)}
                    className="text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                >
                    <div className="flex items-center justify-between">
                        <span
                            className={[
                                'text-xs font-semibold rounded-full px-0.5 py-0.5',
                                g.isOver
                                    ? g.isWin
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700',
                            ].join(' ')}
                        >
                            {g.isOver ? (g.isWin ? 'Won' : 'Over') : 'Active'}
                        </span>
                    </div>
                    {/*div that displays the game mode whether classic or timed*/}

                    <div className="mt-2">
                        <span
                            className={[
                                'text-xs font-semibold rounded-full px-0.5 py-0.5',
                                g.mode === 'classic'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-yellow-100 text-yellow-700',
                            ].join(' ')}
                        >
                            {g.mode === 'classic' ? 'Classic Mode' : 'Timed Mode'}
                        </span>
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                        Attempts Remaining:{' '}
                        <span className="font-semibold text-slate-900">{g.attemptsLeft}</span>
                    </div>

                    <div className="mt-2 text-xs text-slate-400">
                        Created: {new Date(g.createdAt).toLocaleString()}
                    </div>
                </button>
            ))}
        </div>
    );
}
