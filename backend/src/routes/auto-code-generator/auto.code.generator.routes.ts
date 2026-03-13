import { Router } from "express";
import { Response, Request } from "express";
import {
  generatePurchaseOrderCode,
  
} from "../../utils/generate.AutoCode.Counter";

const autoCodeGeneratorRouter = Router();



//purchase order 
autoCodeGeneratorRouter.get(
  "/purchase-auto-code",
  async (req: Request, res: Response) => {
    try {
      const purchaseOrderAutoCode = await generatePurchaseOrderCode();
      res.json({ purchaseOrderAutoCode: purchaseOrderAutoCode });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to get purchase order auto code." });
    }
  },
);




export default autoCodeGeneratorRouter;
