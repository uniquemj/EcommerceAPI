import {z} from 'zod'
import { imageSchema } from './image.validate'

export const variantSchema = z.object({
    color: z.string().trim(),
    size: z.string().trim().optional(),
    price: z.number(),
    stock: z.number().min(0),
    availability: z.boolean().optional(),
    packageWeight: z.number().min(1),
    packageLength: z.string().trim(),
}).strict()

export const updateVariantSchema = z.object({
    color: z.string().trim().optional(),
    size: z.string().trim().optional(),
    images: z.array(z.instanceof(File)).optional(),
    price: z.number().optional(),
    stock: z.number().min(0).optional(),
    availability: z.boolean().optional(),
    packageWeight: z.number().min(1).optional(),
    packageLength: z.string().trim().optional(),
}).strict()
.refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: color, size, images, price, stock, availability, packageWeight, packageLength.",
})


export const stockValidateSchema = z.object({
    stock: z.number().min(1)
}).strict()

export const availabilityValidateSchema = z.object({
    availability: z.boolean()
}).strict()