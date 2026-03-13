import { Request, Response, NextFunction } from "express";
import { generateSupplierCode } from "../utils/generate.AutoCode.Counter";
export const assignSupplierCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const supplierCode = await generateSupplierCode();
        req.body.supplierCode = supplierCode;
        next();
    } catch (error) {
        console.error("Supplier code generation failed:", error);
        res.status(500).json({ message: "Failed to generate supplier code" });
    }
};


