import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { Category, categoryDoc } from "../models/category.models";
import { categorySchemaValidation } from "../schemas/category.schema";
import { AdvancedGenericController } from "../controllers/GenericController";
import { createCategory, getAllCategories, updateCategory } from '../controllers/category.controller';

const categoryRouter = Router();

const categoryServices = new GenericService<categoryDoc>(Category);

const categoryController = new AdvancedGenericController({
    service: categoryServices,
    populate: ["userId", "parentId"],
    validationSchema: categorySchemaValidation,
    searchFields: ["categoryName"]
});

categoryRouter.post("/", createCategory);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", categoryController.getById);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", categoryController.delete);

export default categoryRouter;

