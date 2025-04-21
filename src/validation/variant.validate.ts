import {z} from 'zod'

export const variantSchema = z.object({
    color: z.string(),
    size: z.string().optional(),
    price: z.number(),
    specialPrice: z.number().min(0).max(1).optional(),
    stock: z.number(),
    sellerSKU: z.string().optional(),
    availability: z.boolean().optional()
})