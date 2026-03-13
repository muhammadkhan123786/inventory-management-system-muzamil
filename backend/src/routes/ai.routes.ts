import { Router } from "express";
import { analyzeProduct } from "../controllers/ai.controller";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/", upload.array("images"), analyzeProduct);

export default router;
