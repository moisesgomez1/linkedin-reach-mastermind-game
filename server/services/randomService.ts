require('dotenv').config();
//creating the service function that will make a request to the api to generate a random number

export async function fetchRandomNumbers(): Promise<string> {
  const baseUrl = process.env.RANDOM_ORG_BASE_URL;

  //fixed query params for now

  const num = 4;
  const min = 0;
  const max = 7;

  const url = `${baseUrl}?num=${num}&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;

  try {
    const response = await fetch(url);

    // If the response is not OK, throw an error
    if (!response.ok) {
      throw new Error(`Random.org error: ${response.statusText}`);
    }

    // Read and parse the plain text response
    const numbers = await response.text();

    console.log('This is the result of the call to random.org', numbers);

    return numbers;
  } catch (error) {
    console.error('Random.org failed');

    return 'error';
  }
}
