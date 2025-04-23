import {z} from 'zod'
import { DangerousGoods, WarrantyType } from '../model/variant/variant.model'

export const variantSchema = z.object({
    color: z.string(),
    size: z.string().optional(),
    price: z.number(),
    stock: z.number(),
    availability: z.boolean().optional(),
    packageWeight: z.number().min(1),
    packageLength: z.string(),
    dangerousGoods : z.nativeEnum(DangerousGoods).optional(),
    warrantyType: z.nativeEnum(WarrantyType).optional(),
    warrantyPeriod: z.number().min(0).max(18),
    warrantyPolicy: z.string().optional(),
})