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