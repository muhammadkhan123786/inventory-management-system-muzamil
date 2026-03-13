import { Router } from "express";
import { login, setupPassword, updatePassword } from "../controllers/auth.controller";
import { generalProtecter } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post('/login', login);
authRouter.put('/setup-password', setupPassword)
authRouter.put('/change-password', generalProtecter, updatePassword)

export default authRouter;