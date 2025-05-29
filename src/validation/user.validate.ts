import {z} from 'zod'
import { imageSchema } from './image.validate'
import { VerificationStatus } from '../types/user.types'

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

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];

const imageFile = z.instanceof(File).refine(
  (file) => allowedImageTypes.includes(file.type),
  { message: "Only .jpeg, .jpg, .png images are allowed" }
);


export const addBusinessInfoSchema = z.object({
    legal_document: z.array(imageFile).length(2, "Exactly 2 legal document images are required").optional(),
    store_logo: z.array(imageFile).length(1, "Store logo image is required").optional(),
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

export const updateSellerVerificationSchema = z.object({
    status: z.nativeEnum(VerificationStatus),
    rejection_reason: z.string().optional()
}).strict().refine((data) => data.status !== VerificationStatus.REJECTED || data.rejection_reason?.trim()?.length as number > 0, {
    message: "'rejection_reason' is required with status 'rejected'.",
    path: ['rejected_reason']
})