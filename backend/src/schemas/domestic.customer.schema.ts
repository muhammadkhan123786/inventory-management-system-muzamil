import { z } from 'zod';
import { commonCustomerValidationSchema } from './corporate.customer.schema';

export const domesticCustomerSchema = z.object({
    ...commonCustomerValidationSchema,
    customerType: z.literal("domestic"),

});
