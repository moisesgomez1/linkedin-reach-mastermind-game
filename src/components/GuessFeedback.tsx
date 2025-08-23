import { LastResult } from '@/pages/MasterMind';

type Props = {
    result: LastResult | null;
    attemptsLeft: number | null;
};

export default function GuessFeedback({ result, attemptsLeft }: Props) {
    if (!result && attemptsLeft === null) return null;

    const block = (label: string, value: number) => (
        <div className="text-center px-6 py-4 bg-gray-100 rounded-xl text-black w-40 shadow-md">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-3xl font-bold">{value}</div>
        </div>
    );

    return (
        <div className="flex flex-wrap justify-center gap-6 mt-6">
            {result ? (
                <>
                    {block('Correct Numbers', result.guess.correctNumbers)}
                    {block('Correct Positions', result.guess.correctPositions)}
                    {block('Attempts Left', result.attemptsLeft)}
                </>
            ) : (
                attemptsLeft !== null && block('Attempts Left', attemptsLeft)
            )}
        </div>
    );
}
