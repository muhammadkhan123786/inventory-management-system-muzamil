import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const analyzeImagesWithGemini = async (
  files: { buffer: Buffer; mimetype: string }[],
  retries = 3
): Promise<any> => {
 const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const imageParts = files.map(file => ({
    inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype }
  }));

    const prompt = `
Analyze all provided product images as a single product collection.
Look for details like color, material, brand, usage, and style across ALL images.

Return ONLY valid JSON in this exact structure:
{
  "shortDescription": "Summarize the product briefly based on all views.",
  "description": "Provide a detailed description combining features seen in all images.",
  "tags": "Provide 8-10 UNIQUE, diverse tags (e.g., category, material, color, style)",
  "keywords": "comma, separated, unique, keywords"
}

Constraints: 
- Do NOT repeat the same word in the tags array.
- Ensure tags are relevant to the specific product shown.
`;

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    // Clean JSON more robustly
    const jsonString = responseText.match(/\{[\s\S]*\}/)?.[0] || responseText;
    return JSON.parse(jsonString);

  } catch (error: any) {
    // 503 is Service Unavailable, 429 is Rate Limit
    if ((error.status === 503 || error.status === 429) && retries > 0) {
      const waitTime = Math.pow(2, 4 - retries) * 1000; // Exponential backoff: 1s, 2s, 4s
      console.warn(`Gemini Busy. Retrying in ${waitTime}ms...`);
      await new Promise(res => setTimeout(res, waitTime));
      return analyzeImagesWithGemini(files, retries - 1);
    }
    throw error; // Rethrow if we're out of retries or it's a 400/500 error
  }
};