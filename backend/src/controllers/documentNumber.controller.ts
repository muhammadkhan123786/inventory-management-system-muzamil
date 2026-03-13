import { Request, Response } from "express";
import { generateNextDocumentNumber } from "../services/documentNumber.service";

export class DocumentNumberController {
  static async getNext(req: Request, res: Response) {
    try {
      const { type } = req.query;

      if (!type || typeof type !== "string") {
        return res.status(400).json({
          success: false,
          message: "Document type is required",
        });
      }

      const nextNumber = await generateNextDocumentNumber(type as any);

      return res.status(200).json({
        success: true,
        nextNumber,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to generate document number",
      });
    }
  }
}
