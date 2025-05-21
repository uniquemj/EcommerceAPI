import {z} from 'zod'
import { DangerousGoods, WarrantyType } from '../model/variant.model'
import { imageSchema } from './image.validate'

export const variantSchema = z.object({
    color: z.string().trim(),
    size: z.string().trim().optional(),
    price: z.number(),
    stock: z.number().min(0),
    availability: z.boolean().optional(),
    packageWeight: z.number().min(1),
    packageLength: z.string().trim(),
    dangerousGoods : z.nativeEnum(DangerousGoods).optional(),
    warrantyType: z.nativeEnum(WarrantyType).optional(),
    warrantyPeriod: z.number().min(0).max(18),
    warrantyPolicy: z.string().trim().optional(),
}).strict()

export const updateVariantSchema = z.object({
    color: z.string().trim().optional(),
    size: z.string().trim().optional(),
    images: imageSchema.array().optional(),
    price: z.number().optional(),
    stock: z.number().min(0).optional(),
    availability: z.boolean().optional(),
    packageWeight: z.number().min(1).optional(),
    packageLength: z.string().trim().optional(),
    dangerousGoods : z.nativeEnum(DangerousGoods).optional(),
    warrantyType: z.nativeEnum(WarrantyType).optional(),
    warrantyPeriod: z.number().min(0).max(18).optional(),
    warrantyPolicy: z.string().trim().optional(),
}).strict()
.refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: color, size, images, price, stock, availability, packageWeight, packageLength, dangerousGood, warrantyType, warrantyPeriod, warrantyPolicy",
})


export const stockValidateSchema = z.object({
    stock: z.number().min(1)
}).strict()

export const availabilityValidateSchema = z.object({
    availability: z.boolean()
}).strict()