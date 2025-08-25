/**
 * Evaluates a guess against the secret code.
 * - First pass: Finds numbers that are correct and in the correct position.
 * - Second pass: Finds numbers that are correct but in the wrong position.
 * @param {number[]} secret - The secret code (example: [1, 3, 5, 7])
 * @param {number[]} guess - The player's guess (example: [1, 2, 3, 4])
 * @returns Object with correctNumbers and correctPositions
 */

export function evaluateGuess(
    secret: number[],
    guess: number[]
): {
    correctNumbers: number;
    correctPositions: number;
} {
    let correctPositions = 0;
    let correctNumbers = 0;

    // We are cloning the arrays so we can mutate them without affecting the originals
    const secretCopy = [...secret];
    const guessCopy = [...guess];

    // First Pass: Count exact matches (correct number and correct position)
    for (let i = 0; i < secret.length; i++) {
        if (secret[i] === guess[i]) {
            correctPositions++; // Direct match
            secretCopy[i] = -1; // Mark as "used" so it can't be counted again. We are using -1 to mark as used.
            guessCopy[i] = -1;
        }
    }

    // Second Pass: Count correct numbers in the wrong positions
    for (let i = 0; i < guessCopy.length; i++) {
        const guessNum = guessCopy[i];

        // This works because the indexOf method searches through the whole array
        // and returns the index of the matched number without it being in the correct spot.
        const matchIndex = secretCopy.indexOf(guessNum);

        // If the index has not already been used
        if (matchIndex !== -1) {
            correctNumbers++; // Number exists, just wrong spot
            secretCopy[matchIndex] = -1; // Mark matched number as used
        }
    }
    // Return the end result of the correctNumbers and the correctPositions. This will then be used by the client to display whether all incorrect or some incorrect.
    return { correctNumbers, correctPositions };
}
