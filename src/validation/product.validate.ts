import {z} from 'zod';
import { DangerousGoods, WarrantyType } from '../model/product/product.model';
import { variantSchema } from './variant.validate';

export const productSchema = z.object({
    name: z.string(),
    category: z.string({message: "At least 1 category required."}),
    productDescription: z.string().optional(),
    productHighlights: z.string().optional(),
    packageWeight: z.number().min(1),
    packageLength: z.string(),
    dangerousGoods : z.nativeEnum(DangerousGoods).optional(),
    warrantyType: z.nativeEnum(WarrantyType).optional(),
    warrantyPeriod: z.number().min(1).max(18),
    warrantyPolicy: z.string().optional(),
    variants: variantSchema.array().optional()
})