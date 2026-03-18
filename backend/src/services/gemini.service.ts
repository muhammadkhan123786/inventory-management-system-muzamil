import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const analyzeImagesWithGemini = async (
  files: { buffer: Buffer; mimetype: string }[],
  retries = 3
): Promise<any> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
  "tags": "category, material, color, style, feature, use case, benefit, type",  // ← Changed to comma-separated string
  "keywords": "comma, separated, unique, keywords"
}

Constraints: 
- tags should be 8-10 UNIQUE, diverse, comma-separated values
- keywords should be 8-10 UNIQUE, diverse, comma-separated values
- Do NOT repeat the same word in either field
- Ensure tags and keywords are relevant to the specific product shown
`;

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    // Clean JSON more robustly
    const jsonString = responseText.match(/\{[\s\S]*\}/)?.[0] || responseText;
    const parsedResponse = JSON.parse(jsonString);
    
    // Ensure both fields are strings
    return {
      shortDescription: parsedResponse.shortDescription || "",
      description: parsedResponse.description || "",
      tags: typeof parsedResponse.tags === 'string' 
        ? parsedResponse.tags 
        : Array.isArray(parsedResponse.tags) 
          ? parsedResponse.tags.join(', ') 
          : "",
      keywords: parsedResponse.keywords || ""
    };

  } catch (error: any) {
    // 503 is Service Unavailable, 429 is Rate Limit
    if ((error.status === 503 || error.status === 429) && retries > 0) {
      const waitTime = Math.pow(2, 4 - retries) * 1000;
      console.warn(`Gemini Busy. Retrying in ${waitTime}ms...`);
      await new Promise(res => setTimeout(res, waitTime));
      return analyzeImagesWithGemini(files, retries - 1);
    }
    throw error;
  }
};