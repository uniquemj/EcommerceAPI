import {z} from 'zod';
import { variantSchema } from './variant.validate';

export const productSchema = z.object({
    name: z.string(),
    category: z.string({message: "At least 1 category required."}),
    productDescription: z.string().optional(),
    productHighlights: z.string().optional(),
    variants: variantSchema.array()
}).strict()

export const updateProductSchema = z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    productDescription: z.string().optional(),
    productHighlights: z.string().optional(),
    variants: variantSchema.array().optional()
}).strict().refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: name, category, productDescription, productHighlights, variants"
})