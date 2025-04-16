import {string, z} from 'zod';
import { DangerousGoods, WarrantyType } from '../model/product/product.model';


export const productSchema = z.object({
    name: z.string(),
    category: z.string({message: "At least 1 category required."}),
    productDescription: z.string().optional(),
    productHighlights: z.string().optional(),
    packageWeight: z.string(),
    packageLength: z.string(),
    dangerousGoods : z.nativeEnum(DangerousGoods).optional(),
    warrantyType: z.nativeEnum(WarrantyType).optional(),
    warrantyPeriod: z.string(),
    warrantyPolicy: z.string().optional()
})