// // routes/product.routes.ts
// import { createProductValidation } from '../schemas/product.schema';
// import { Router } from "express";
// import { GenericService } from "../services/generic.crud.services";
// import { ProductDoc, ProductModal } from '../models/product.models';
// import { AdvancedGenericController } from "../controllers/GenericController";
// import { createUploader } from "../config/multer";
// import { mapUploadedFilesToBody } from "../middleware/mapUploadedFiles";
// import { syncImageFilenames} from "../middleware/imageSync.middleware"

// const productRoutes = Router();

// const productsBaseService = new GenericService<ProductDoc>(ProductModal);

// // ✅ Configure controller with category population
// const productController = new AdvancedGenericController({
//     service: productsBaseService,
//     populate: [
//         "userId",
//         {
//             path: "categoryId",
//             select: "_id categoryName level parentId",
//             model: "Category"
//         },
//         // Populate the entire category path
//         {
//             path: "categoryPath",
//             select: "_id categoryName level parentId",
//             model: "Category"
//         }
//     ],
//     validationSchema: createProductValidation,
//     searchFields: [
//         "productName",
//         "sku",
//         "barcode",
//         "brand",
//         "manufacturer",
//         "modelNumber",
//         "description",
//         "shortDescription",
//         "tags",
//         "keywords"
//     ]
// });

// // ✅ Create uploader for product images
// const productUpload = createUploader([
//     {
//         name: "images", // This should match your frontend field name
//         maxCount: 10, // Maximum 10 images per product
//         mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
//     },
//     // You can add more fields if needed
//     {
//         name: "featuredImage",
//         maxCount: 1,
//         mimeTypes: ["image/jpeg", "image/png", "image/webp"],
//     },
//     {
//         name: "thumbnail",
//         maxCount: 1,
//         mimeTypes: ["image/jpeg", "image/png", "image/webp"],
//     }
// ]);

// // ✅ Routes with upload middleware
// productRoutes.get("/", productController.getAll);

// productRoutes.get("/:id", productController.getById);

// // ✅ POST route with image upload
// productRoutes.post(
//     "/",
//     productUpload,
//     mapUploadedFilesToBody(
//         "/uploads", // Base path for uploaded files
//         { 
//             images: "images", // Map "images" field to "images" in body
//             featuredImage: "featuredImage",
//             thumbnail: "thumbnail"
//         },
//         ["featuredImage", "thumbnail"] // These are single fields
//     ),
//     // syncImageFilenames,
//     productController.create
// );

// // ✅ PUT route with image upload
// productRoutes.put(
//     "/:id",
//     productUpload,
//     mapUploadedFilesToBody(
//         "/uploads",
//         { 
//             images: "images",
//             featuredImage: "featuredImage",
//             thumbnail: "thumbnail"
//         },
//         ["featuredImage", "thumbnail"]
//     ),
//     productController.update
// );

// productRoutes.delete("/:id", productController.delete);

// export default productRoutes;



// routes/product.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import { createProductValidation } from "../schemas/product.schema";
import { ProductDoc, ProductModal } from "../models/product.models";
import { Category } from "../models/category.models";
import { AdvancedGenericController } from "../controllers/GenericController";
import { ProductService } from "../services/product.service";
import { buildProductFilter } from "../middleware/productFilter.middleware";
import { createUploader } from "../config/multer";
import { mapUploadedFilesToBody } from "../middleware/mapUploadedFiles";

const productRoutes = Router();

// ── Services ────────────────────────────────────────────────────────────────
const productService = new ProductService(ProductModal, Category);

// ── Shared populate config ───────────────────────────────────────────────────
const POPULATE_CONFIG = [
  "userId",
  {
    path: "categoryId",
    select: "_id categoryName level parentId",
    model: "Category",
  },
  {
    path: "categoryPath",
    select: "_id categoryName level parentId",
    model: "Category",
  },
];

// ── Keep AdvancedGenericController for non-list endpoints ────────────────────
const productController = new AdvancedGenericController({
  service: productService,          // reuse same service instance
  populate: POPULATE_CONFIG,
  validationSchema: createProductValidation,
  searchFields: [
    "productName", "sku", "barcode", "brand", "manufacturer",
    "modelNumber", "description", "shortDescription", "tags", "keywords",
  ],
});

// ── Image upload middleware ──────────────────────────────────────────────────
const productUpload = createUploader([
  { name: "images",        maxCount: 10, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
  { name: "featuredImage", maxCount: 1,  mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
  { name: "thumbnail",     maxCount: 1,  mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
]);

const mapImages = mapUploadedFilesToBody(
  "/uploads",
  { images: "images", featuredImage: "featuredImage", thumbnail: "thumbnail" },
  ["featuredImage", "thumbnail"]
);

// ── GET / — filtered + paginated ─────────────────────────────────────────────
/**
 * Supported query params:
 *   search        string   – searches name, sku, brand, manufacturer, etc.
 *   categoryId    string   – category _id (includes descendants automatically)
 *   status        string   – e.g. "active" | "inactive" | "draft"
 *   stockStatus   string   – e.g. "in_stock" | "out_of_stock" | "low_stock"
 *   featured      "true"   – only featured products
 *   page          number   – default 1
 *   limit         number   – default 20
 *   sortBy        string   – field name, default "createdAt"
 *   sortOrder     "asc"|"desc" – default "desc"
 */
productRoutes.get(
  "/",
  buildProductFilter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = "1",
        limit = "20",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query as Record<string, string>;

      const result = await productService.getFilteredProducts({
        filter:     (req as any).productFilter ?? {},
        categoryId: (req as any).filterCategoryId,
        page:       Math.max(1, parseInt(page, 10)),
        limit:      Math.min(100, Math.max(1, parseInt(limit, 10))), // cap at 100
        sortBy,
        sortOrder:  sortOrder === "asc" ? "asc" : "desc",
        populate:   POPULATE_CONFIG,
      });
res.json({
        success:    true,
        data:       result.data,
        total:      result.total,
        page:       result.page,
        limit:      result.limit,
        totalPages: result.totalPages,
        statistics: result.statistics,   
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /:id ──────────────────────────────────────────────────────────────────
productRoutes.get("/:id", productController.getById);

// ── POST / ───────────────────────────────────────────────────────────────────
productRoutes.post("/", productUpload, mapImages, productController.create);

// ── PUT /:id ──────────────────────────────────────────────────────────────────
productRoutes.put("/:id", productUpload, mapImages, productController.update);

// ── DELETE /:id ───────────────────────────────────────────────────────────────
productRoutes.delete("/:id", productController.delete);

export default productRoutes;