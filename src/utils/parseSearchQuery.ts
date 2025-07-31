// parseSearchQuery.ts
export async function parseSearchQuery(model: any, rawInput: string) {
  const prompt = `
You are an AI that extracts structured search parameters from natural language LSAT queries.

Given the query: "${rawInput}", extract any of the following fields if available:
- preptest (number)
- section (number)
- question (number)
- passage_title (string)
- keywords (array of strings)

Respond ONLY with a compact JSON object. Example:
{"preptest": 89, "section": 2, "question": 14}
`;

  const chat = model.startChat();

  const result = await chat.sendMessage(prompt);
  const resultText = result.response.text();

  try {
    return JSON.parse(resultText);
  } catch (e) {
    console.error("Failed to parse Gemini output", resultText);
    return {};
  }
}