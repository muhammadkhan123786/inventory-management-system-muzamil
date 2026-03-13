import { Router } from "express";
import { userRegister } from "../controllers/auth.controller";
import { registerShopDetails } from "../controllers/shop.controller";
import { createUploader } from "../config/multer";

const shopUpload = createUploader([
    {
        name: 'logo',
        maxCount: 1,
        mimeTypes: ['image/jpeg', 'image/png']
    }
]);


const shopRouter = Router();

shopRouter.post('/shop', shopUpload, userRegister, registerShopDetails)

export default shopRouter;