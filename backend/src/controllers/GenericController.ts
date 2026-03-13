// controllers/GenericController.enhanced.ts
import { Request, Response } from "express";
import { GenericService } from "../services/generic.crud.services";
import { Document, PopulateOptions, Types } from "mongoose";
import { ZodObject, ZodRawShape } from "zod";
import { normalizeToStringArray } from "../utils/query.utils";
import { TechnicianAuthRequest } from "../middleware/auth.middleware";
interface ControllerOptions<T extends Document> {
  service: GenericService<T>;
  populate?: (string | PopulateOptions)[];
  validationSchema?: ZodObject<ZodRawShape>;
  searchFields?: string[];
}

export class AdvancedGenericController<T extends Document> {
  constructor(private options: ControllerOptions<T>) {}

  create = async (req: Request, res: Response) => {
    try {
      let data = req.body;
      console.log("Creating document with data:", data);

      if (this.options.validationSchema) {
        data = this.options.validationSchema.parse(data);
      }

      if (req.body.userId) {
        data.userId = new Types.ObjectId(req.body.userId);
      }

      const doc = await this.options.service.create(data);
      res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Failed to create document",
      });
    }
  };
  getAll = async (req: TechnicianAuthRequest, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
        search,
        filter,
        includeStats = "false",
        // Category filters
        categoryId,
        level1CategoryId,
        level2CategoryId,
        level3CategoryId,
        // Other filters

        stockStatus,
        featured,
        ...rawFilters
      } = req.query;

      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const queryFilters: Record<string, any> = { isDeleted: false };

      if (!req.user) {
        if (!req.body.userId) {
          return res.json({ status: false, message: "Please provide userId." });
        }
        queryFilters.userId = new Types.ObjectId(req.body.userId);
      } else if (req.user && req.user.userId) {
        queryFilters.userId = new Types.ObjectId(req.user.userId);
      }
      //  if (req.technicianId) {
      //        queryFilters.technicianId = new Types.ObjectId(req.technicianId);
      //    }
      // ✅ GENERIC SEARCH across searchFields
      if (search && this.options.searchFields?.length) {
        queryFilters.$or = this.options.searchFields.map((field) => ({
          [field]: { $regex: search, $options: "i" },
        }));
      }
      // ✅ CATEGORY FILTERS
      // Direct category filter
      if (categoryId && Types.ObjectId.isValid(categoryId as string)) {
        queryFilters.categoryId = new Types.ObjectId(categoryId as string);
      }

      // Level 1 category filter
      if (
        level1CategoryId &&
        Types.ObjectId.isValid(level1CategoryId as string)
      ) {
        queryFilters.categoryId = new Types.ObjectId(
          level1CategoryId as string,
        );
      }

      // Level 2 category filter (check categoryPath array)
      if (
        level2CategoryId &&
        Types.ObjectId.isValid(level2CategoryId as string)
      ) {
        queryFilters.categoryPath = new Types.ObjectId(
          level2CategoryId as string,
        );
      }

      // Level 3 category filter (check categoryPath array)
      if (
        level3CategoryId &&
        Types.ObjectId.isValid(level3CategoryId as string)
      ) {
        queryFilters.categoryPath = new Types.ObjectId(
          level3CategoryId as string,
        );
      }

      // ✅ STOCK STATUS FILTER
      if (stockStatus) {
        // This assumes you have stock status in the main product document
        // If it's in attributes, you'll need to adjust this
        queryFilters["attributes.stock.stockStatus"] = stockStatus;
      }

      // ✅ FEATURED FILTER
      if (featured === "true") {
        queryFilters["attributes.stock.featured"] = true;
      }

      // ✅ Dynamic filters from rawFilters
      Object.keys(rawFilters).forEach((key) => {
        const value = rawFilters[key];

        // Handle array of IDs (e.g., categoryIds, warehouseIds)
        if (key.endsWith("Ids")) {
          const ids = normalizeToStringArray(value)
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

          if (ids.length) {
            queryFilters[key.replace("Ids", "Id")] = { $in: ids };
          }
          return;
        }

        // Handle single ObjectId
        if (typeof value === "string" && Types.ObjectId.isValid(value)) {
          queryFilters[key] = new Types.ObjectId(value);
        } else {
          queryFilters[key] = value;
        }
      });

      // ✅ Get product statistics (only if requested and model is Product)
      let statistics = null;
      if (
        includeStats === "true" &&
        this.options.service.model.modelName === "Product"
      ) {
        statistics = await this.options.service.getProductStats(queryFilters);
      }

      let { query, total, activeCount, inactiveCount } =
        await this.options.service.getQuery(queryFilters, {
          populate: this.options.populate,
        });

      const sortOption: any = {};
      sortOption[sortBy as string] = order === "asc" ? 1 : -1;

      // ✅ Check if filter=all, then skip pagination
      if (filter === "all") {
        const data = await query
          .sort(sortOption)
          .find({ isActive: true })
          .exec();

        const response: any = {
          success: true,
          total,
          page: 1,
          limit: total,
          data,
        };

        if (statistics) {
          response.statistics = statistics;
        }

        return res.status(200).json(response);
      }

      // 🔹 Normal pagination
      const data = await query
        .sort(sortOption)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec();

      const response: any = {
        success: true,
        total,
        activeCount,
        inactiveCount,
        page: pageNumber,
        limit: pageSize,
        data,
      };

      if (statistics) {
        response.statistics = statistics;
      }

      res.status(200).json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch documents",
      });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const populateQuery = req.query.populate as string | undefined;

      const populate = populateQuery
        ? populateQuery.split(",").map((p) => p.trim())
        : this.options.populate;

      const doc = await this.options.service.getById(id, { populate });

      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(200).json({ success: true, data: doc });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch document",
      });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      if (!Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      let data = req.body;
      if (this.options.validationSchema) {
        data = this.options.validationSchema.partial().parse(data);
      }

      const updated = await this.options.service.updateById(id, data, {
        populate: this.options.populate,
      });
      if (!updated)
        return res.status(404).json({ message: "Document not found" });

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Failed to update document",
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      if (!Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      const deleted = await this.options.service.deleteById(id);
      console.log("deleted", deleted);
      if (!deleted)
        return res.status(404).json({ message: "Document not found" });

      res
        .status(200)
        .json({ success: true, message: "Document deleted successfully" });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to delete document",
      });
    }
  };
}
