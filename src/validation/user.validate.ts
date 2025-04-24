import {z} from 'zod'

export const customerRegisterSchema = z.object({
    fullname: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

export const sellerRegisterSchema = z.object({
    store_name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export const updateCustomerProfileSchema = z.object({
    fullname: z.string().optional(),
    phone_number: z.string().min(10).optional(),
    date_of_birth: z.string().optional(),
    email: z.string().optional()
})

export const updatePasswordSchema = z.object({
    old_password: z.string().min(8),
    new_password: z.string().min(8)
})