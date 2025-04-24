import {z} from 'zod'
import { DangerousGoods, WarrantyType } from '../model/variant/variant.model'
import { imageSchema } from './image.validate'

export const variantSchema = z.object({
    color: z.string(),
    size: z.string().optional(),
    images: imageSchema.array(),
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
export const updateVariantSchema = z.object({
    color: z.string().optional(),
    size: z.string().optional(),
    images: imageSchema.array().optional(),
    price: z.number().optional(),
    stock: z.number().optional(),
    availability: z.boolean().optional(),
    packageWeight: z.number().min(1).optional(),
    packageLength: z.string().optional(),
    dangerousGoods : z.nativeEnum(DangerousGoods).optional(),
    warrantyType: z.nativeEnum(WarrantyType).optional(),
    warrantyPeriod: z.number().min(0).max(18).optional(),
    warrantyPolicy: z.string().optional(),
})