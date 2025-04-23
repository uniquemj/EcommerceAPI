import {z} from 'zod'


export const addressSchema = z.object({
    full_name: z.string(),
    email: z.string().email(),
    phone_number: z.string().min(10),
    region: z.string(),
    city: z.string(),
    address: z.string()
})

export const updateAddressSchema = z.object({
    full_name: z.string().optional(),
    email: z.string().email().optional(),
    phone_number: z.string().min(10).optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional()
})