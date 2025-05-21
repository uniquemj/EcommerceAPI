import {z} from 'zod';
import { variantSchema } from './variant.validate';
import { ArchieveStatus } from '../types/product.types';

export const productSchema = z.object({
    name: z.string().trim().min(5).max(250),
    category: z.string({message: "At least 1 category required."}).trim(),
    productDescription: z.string().trim().optional(),
    productHighlights: z.string().trim().optional(),
    variants: variantSchema.array().min(1, {message: "At least one variant is required."}),
    variantImages: z.array(z.instanceof(File)).optional()
}).strict()

export const updateProductSchema = z.object({
    name: z.string().trim().min(5).max(250).optional(),
    category: z.string().trim().optional(),
    productDescription: z.string().trim().optional(),
    productHighlights: z.string().trim().optional(),
    productAvailability: z.boolean().optional(),
    archieveStatus: z.nativeEnum(ArchieveStatus).optional(),
    variants: variantSchema.array().optional()
}).strict().refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: name, category, productDescription, productHighlights, variants, archieveStatus"
})
