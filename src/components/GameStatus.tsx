type Props = {
    isOver: boolean;
    isWin: boolean;
    secret?: number[] | null;
};

export default function GameStatus({ isOver, isWin, secret }: Props) {
    if (!isOver) return null;

    return (
        <div className="text-xl font-bold text-center mt-4 space-y-2">
            {isWin ? (
                <span className="text-green-400">🎉 You Won!</span>
            ) : (
                <>
                    <div className="text-red-400">💀 Game Over</div>
                    {secret && (
                        <div className="text-gray-300 font-medium">
                            The code was: <span className="text-white">{secret.join(' ')}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}