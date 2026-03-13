import { Request, Response } from "express";
import { analyzeImagesWithGemini } from "../services/gemini.service";
import path from "path";
import fs from "fs/promises";



export const analyzeProduct = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "No images provided" });

    // Read buffers from disk for AI
    const buffers = await Promise.all(
      files.map(async (f) => ({
        buffer: await fs.readFile(path.join(process.cwd(), "uploads", f.filename)),
        mimetype: f.mimetype
      }))
    );

    const aiResponse = await analyzeImagesWithGemini(buffers);

    const imageUrls = files.map(f => `http://localhost:4000/uploads/${f.filename}`);
console.log("imag", imageUrls);
    res.json({
      success: true,
      imageCount: files.length,
      imageUrls,
      ai: aiResponse,
    });
  } catch (error: any) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Image analysis failed" });
  }
};


