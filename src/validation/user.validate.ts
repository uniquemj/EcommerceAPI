import {z} from 'zod'
import { imageSchema } from './image.validate'

export const customerRegisterSchema = z.object({
    fullname: z.string().trim().min(6).max(50),
    email: z.string().email(),
    password: z.string().min(8)
})

export const sellerRegisterSchema = z.object({
    fullname: z.string().trim().min(6).max(50),
    store_name: z.string().min(3).max(20).trim(),
    email: z.string().email(),
    password: z.string().min(8)
})

export const adminRegisterSchema = z.object({
    fullname: z.string().trim().min(6).max(50),
    username: z.string().trim().min(5),
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
    fullname: z.string().trim().min(6).max(50).optional(),
    phone_number: z.string().regex(/^[0-9]{10}$/,{
        message: "Only numbers are allowed and should be of length 10."
    }).optional(),
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
    legal_document: z.array(z.instanceof(File)).optional(),
    store_logo: z.array(z.instanceof(File)).optional(),
    address: z.string().trim(),
    city: z.string().trim(),
    country: z.string().trim(),
    phone_number: z.string().regex(/^[0-9]{10}$/,{
        message: "Only numbers are allowed and should be of length 10."
    }),
}).strict()

export const updateBusinessInfoSchema = z.object({
    store_name: z.string().trim().min(3).max(20).optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    country: z.string().trim().optional(),
    phone_number: z.string().regex(/^[0-9]{10}$/,{
        message: "Only numbers are allowed and should be of length 10."
    }).optional(),
}).strict().refine((data)=>Object.keys(data).length>0,{
    message:
      "At least one field must be provided to update. Available fields: store_name, address, city, country, phone_number.",
})

export const updateAdminInfo = z.object({
    fullname: z.string().trim().optional()
}).strict().refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: fullname."
})

export const updateNormalAdminInfo = z.object({
    fullname: z.string().trim().optional(),
    password: z.string().optional(),
    isSuperAdmin: z.boolean().optional()
}).strict().refine((data)=>Object.keys(data).length > 0, {
    message: "At least one field must be provided to update. Available fields: fullname, password, isSuperAdmin."
})


export const resendVerificationEmailSchema = z.object({
    email: z.string().email()
}).strict()