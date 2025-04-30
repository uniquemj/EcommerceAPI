import {z} from 'zod'


export const addressSchema = z.object({
    full_name: z.string().trim().min(6).max(50),
    email: z.string().email(),
    phone_number: z.string().regex(/^[0-9]{10}$/,{
        message: "Only numbers are allowed and should be of length 10."
    }),
    region: z.string().trim(),
    city: z.string().trim(),
    address: z.string().trim().min(10).max(100)
})

export const updateAddressSchema = z.object({
    full_name: z.string().trim().min(6).max(50).optional(),
    email: z.string().email().optional(),
    phone_number: z.string().regex(/^[0-9]{10}$/,{
        message: "Only numbers are allowed and should be of length 10."
    }).optional(),
    region: z.string().trim().optional(),
    city: z.string().trim().optional(),
    address: z.string().trim().min(10).max(100).optional()
}).strict().refine((data)=>Object.keys(data).length > 0,{
    message: "At least one field must be provided to update. Available fields: full_name, email, phone_number, region, city, address",
})