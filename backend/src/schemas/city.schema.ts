import { z } from "zod";

export const cityModelCreateSchema = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    countryId: z.string().min(1, "Please select country."),
    cityName: z.string().min(1, "City name is required"),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});