import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { channelDoc, Channels } from "../models/channel.models"
import { channelSchemaValidation } from "../schemas/channel.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const productChannelsRouter = Router();

const productChannelServices = new GenericService<channelDoc>(Channels);

const productChannelsController = new AdvancedGenericController({
    service: productChannelServices,
    populate: ["userId"],
    validationSchema: channelSchemaValidation,
    searchFields: ["channelName"]
});

productChannelsRouter.get("/", productChannelsController.getAll);
productChannelsRouter.get("/:id", productChannelsController.getById);
productChannelsRouter.post("/", productChannelsController.create);
productChannelsRouter.put("/:id", productChannelsController.update);
productChannelsRouter.delete("/:id", productChannelsController.delete);

export default productChannelsRouter;

