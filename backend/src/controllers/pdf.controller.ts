import { GrnModel } from "../models/grn.models";
import { generatePdfFromTemplate } from '../utils/pdfGenerator';
import { Request, Response } from "express";
import { GoodsReturn } from "../models/goodsReturn.model";


export const exportGRNToPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const grn = await GrnModel.findById(id)
      .populate({
        path: "purchaseOrderId",
        populate: { path: "supplier" }
      })
      .lean();

    if (!grn) return res.status(404).json({ message: "GRN not found" });

    // SAFE DATE FORMATTING
    const formattedDate = grn.receivedDate 
      ? new Date(grn.receivedDate).toLocaleDateString('en-GB') 
      : 'N/A';

    const pdfData = {
      companyName: "Humber Mobility Scooter",
      reportTitle: "Goods Received Note",
      generatedAt: new Date().toLocaleDateString('en-GB'),
      grn: {
        ...grn,
        receivedDate: formattedDate 
      }
    };

    // IMPORTANT: Ensure your file is templates/grn-report.hbs
    const pdfBuffer = await generatePdfFromTemplate('grn', pdfData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${grn.grnNumber}.pdf`);
    return res.status(200).send(pdfBuffer);

  } catch (err: any) {
    console.error("CRITICAL BACKEND ERROR:", err.message); // Look at your VS Code terminal!
    return res.status(500).json({ success: false, message: err.message });
  }
};





export const exportGRTNToPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 1. Deep populate to reach the supplier contact info
    const grtn = await GoodsReturn.findById(id)
      .populate({
        path: "grnId",
        populate: {
          path: "purchaseOrderId",
          populate: { path: "supplier" }
        }
      })
      .lean();

    if (!grtn) return res.status(404).json({ message: "Return Note not found" });

    // 2. Data Transformation (Calculate sum of items)
    const totalAmount = grtn.items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);

    const pdfData = {
      companyName: "Humber Mobility Scooter",
      grtn: {
        ...grtn,
        returnDate: new Date(grtn.returnDate).toLocaleDateString('en-GB'),
        totalAmountCalculated: totalAmount.toFixed(2),
        returnNumber: grtn.returnNumber,
      }
    };

    // 3. Generate PDF (ensure file is named grtn-report.hbs)
    const pdfBuffer = await generatePdfFromTemplate('grtn-report', pdfData);

    // 4. Send Response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${grtn.returnNumber || 'Return'}.pdf`);
    return res.status(200).send(pdfBuffer);

  } catch (err: any) {
    console.error("PDF EXPORT ERROR:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};