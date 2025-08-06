import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON if it's a clean array/object
    let schedule;
    try {
      schedule = JSON.parse(text);
    } catch (err) {
      // Try to extract JSON inside markdown or code block
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        schedule = JSON.parse(match[1]);
      } else {
        return res.status(500).json({ error: "Unable to parse Gemini response as JSON", raw: text });
      }
    }

    return res.status(200).json({ schedule });
  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
