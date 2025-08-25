import { fetchRandomNumbers } from './randomService';

/**
 * Creates a new game object, I am returning just the secret code for now. Will persist in db later
 */
export async function createGameSecret(): Promise<number[]> {
    // Use the random number service to generate the 4-digit secret
    const secret = await fetchRandomNumbers();
    return secret;
}
