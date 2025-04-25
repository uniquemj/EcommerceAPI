import {z} from 'zod'
import { imageSchema } from './image.validate'

export const customerRegisterSchema = z.object({
    fullname: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

export const sellerRegisterSchema = z.object({
    fullname: z.string(),
    store_name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

export const adminRegisterSchema = z.object({
    fullname: z.string(),
    username: z.string(),
    email: z.string().email(),
    isSuperAdmin: z.boolean(),
    password: z.string().min(5)
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export const adminLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5)
})

export const updateCustomerProfileSchema = z.object({
    fullname: z.string().optional(),
    phone_number: z.string().min(10).optional(),
    date_of_birth: z.string().optional(),
}).strict().refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: fullname, date_of_birth, phone_number.",
})

export const updatePasswordSchema = z.object({
    old_password: z.string().min(8),
    new_password: z.string().min(8)
}).strict()

export const updateAdminPasswordSchema = z.object({
    old_password: z.string().min(5),
    new_password: z.string().min(5)
}).strict()

export const addBusinessInfoSchema = z.object({
    legal_document: imageSchema.array(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
    phone_number: z.string().min(10)
})

export const updateBusinessInfoSchema = z.object({
    store_name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    phone_number: z.string().min(10).optional()
}).strict().refine((data)=>Object.keys(data).length>0,{
    message:
      "At least one field must be provided to update. Available fields: store_name, address, city, country, phone_number.",
})

export const updateAdminInfo = z.object({
    fullname: z.string().optional()
}).strict().refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: fullname."
})

export const updateNormalAdminInfo = z.object({
    fullname: z.string().optional(),
    password: z.string().optional(),
    isSuperAdmin: z.boolean().optional()
}).strict().refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: fullname, password, isSuperAdmin."
})