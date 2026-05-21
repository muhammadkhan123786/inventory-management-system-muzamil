// services/product.service.ts

import { Model, Types, PipelineStage } from "mongoose";
import { customAlphabet } from "nanoid";

import { GenericService } from "./generic.crud.services";
import { ProductDoc } from "../models/product.models";
import { categoryDoc } from "../models/category.models";

// ─────────────────────────────────────────────────────────────────────────────
// Barcode Generator
// ─────────────────────────────────────────────────────────────────────────────

const nanoid = customAlphabet("1234567890", 12);

const generateBarcode = () => {
  return nanoid();
};

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductQueryOptions {
  filter?: any;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  populate?: any[];
}

export interface ProductStatistics {
  total: number;
  activeCount: number;
  inactiveCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  featuredCount: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statistics: ProductStatistics;
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Service
// ─────────────────────────────────────────────────────────────────────────────

export class ProductService extends GenericService<ProductDoc> {
  private readonly productModel: Model<ProductDoc>;
  private readonly CategoryModel: Model<categoryDoc>;

  constructor(
    productModel: Model<ProductDoc>,
    categoryModel: Model<categoryDoc>
  ) {
    super(productModel);

    this.productModel = productModel;
    this.CategoryModel = categoryModel;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Generate Unique Barcode
  // ───────────────────────────────────────────────────────────────────────────

  private async generateUniqueBarcode(): Promise<string> {
    let barcode = "";
    let exists = true;

    while (exists) {
      barcode = generateBarcode();

      const existingProduct = await this.productModel.findOne({
        barcode,
      });

      exists = !!existingProduct;
    }

    return barcode;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CREATE PRODUCT
  // Override generic create method
  // ───────────────────────────────────────────────────────────────────────────

  async create(data: Partial<ProductDoc>): Promise<ProductDoc> {
    // ❌ Never trust frontend barcode
    delete (data as any).barcode;

    // ✅ Generate secure barcode from backend
    const barcode = await this.generateUniqueBarcode();

    // ✅ Create final product payload
    const productPayload = {
      ...data,
      barcode,
    };

    // ✅ Save product
    const product = await this.productModel.create(productPayload);

    return product;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Get All Child Categories
  // ───────────────────────────────────────────────────────────────────────────

  private async getDescendantCategoryIds(
    categoryId: string
  ): Promise<Types.ObjectId[]> {
    if (!Types.ObjectId.isValid(categoryId)) {
      return [];
    }

    const rootId = new Types.ObjectId(categoryId);

    const visited = new Set<string>([rootId.toString()]);

    const findChildren = async (parentId: Types.ObjectId) => {
      const children = await this.CategoryModel.find(
        { parentId },
        { _id: 1 }
      ).lean<{ _id: Types.ObjectId }[]>();

      for (const child of children) {
        const id = child._id.toString();

        if (!visited.has(id)) {
          visited.add(id);

          await findChildren(new Types.ObjectId(id));
        }
      }
    };

    await findChildren(rootId);

    return Array.from(visited).map(
      (id) => new Types.ObjectId(id)
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Filter Products
  // ───────────────────────────────────────────────────────────────────────────

  async getFilteredProducts(
    options: ProductQueryOptions
  ): Promise<PaginatedResult<ProductDoc>> {
    const {
      filter = {},
      categoryId,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      populate = [],
    } = options;

    const query: any = {
      ...filter,
      isDeleted: false,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Category Filtering
    // ─────────────────────────────────────────────────────────────────────────

    if (categoryId && categoryId !== "all") {
      const descendantIds =
        await this.getDescendantCategoryIds(categoryId);

      if (descendantIds.length > 0) {
        query.$and = [
          ...(query.$and ?? []),
          {
            $or: [
              {
                categoryId: {
                  $in: descendantIds,
                },
              },
              {
                categoryPath: {
                  $in: descendantIds,
                },
              },
            ],
          },
        ];
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────────────────────────────────────────

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    // ─────────────────────────────────────────────────────────────────────────
    // Queries
    // ─────────────────────────────────────────────────────────────────────────

    const [paginatedData, statsResult] = await Promise.all([
      // Products
      this.productModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .lean(),

      // Statistics
      this.productModel.aggregate([
        { $match: query },

        {
          $unwind: {
            path: "$attributes",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: 1,
            },

            activeCount: {
              $sum: {
                $cond: [
                  { $eq: ["$isActive", true] },
                  1,
                  0,
                ],
              },
            },

            inactiveCount: {
              $sum: {
                $cond: [
                  { $eq: ["$isActive", false] },
                  1,
                  0,
                ],
              },
            },

            inStockCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$attributes.stock.stockStatus",
                      "in-stock",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            lowStockCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$attributes.stock.stockStatus",
                      "low-stock",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            outOfStockCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$attributes.stock.stockStatus",
                      "out-of-stock",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            featuredCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$attributes.stock.featured",
                      true,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ] as PipelineStage[]),
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // Statistics Formatting
    // ─────────────────────────────────────────────────────────────────────────

    const rawStats = statsResult[0] ?? {};

    const statistics: ProductStatistics = {
      total: rawStats.total ?? 0,
      activeCount: rawStats.activeCount ?? 0,
      inactiveCount: rawStats.inactiveCount ?? 0,
      inStockCount: rawStats.inStockCount ?? 0,
      lowStockCount: rawStats.lowStockCount ?? 0,
      outOfStockCount: rawStats.outOfStockCount ?? 0,
      featuredCount: rawStats.featuredCount ?? 0,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Final Response
    // ─────────────────────────────────────────────────────────────────────────

    return {
      data: paginatedData as ProductDoc[],
      total: statistics.total,
      page,
      limit,
      totalPages: Math.ceil(statistics.total / limit),
      statistics,
    };
  }
}