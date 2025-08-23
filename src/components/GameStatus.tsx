type Props = {
    isOver: boolean;
    isWin: boolean;
};

export default function GameStatus({ isOver, isWin }: Props) {
    if (!isOver) return null;

    return (
        <div className="text-xl font-bold text-center mt-4">
            {isWin ? (
                <span className="text-green-400">🎉 You Won!</span>
            ) : (
                <span className="text-red-400">💀 Game Over</span>
            )}
        </div>
    );
}
