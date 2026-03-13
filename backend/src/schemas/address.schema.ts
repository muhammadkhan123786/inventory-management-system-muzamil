import { z } from "zod";


export const adressCreateSchema = z.object({
    address: z.string().min(5, "Address is required."),
    zipCode: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    countryId: z.string().optional(),
    cityId: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});