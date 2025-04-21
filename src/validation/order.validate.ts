import {z} from 'zod'
import { PaymentMethod, PaymentStatus } from '../model/order/order.model'

export const deliveryInfoSchema = z.object({
    full_name: z.string(),
    email: z.string().email(),
    phone_number: z.string().min(10),
    region: z.string(),
    city: z.string(),
    address: z.string()
})

export const paymentMethodSchema = z.object({
    payment_method: z.nativeEnum(PaymentMethod),
    payment_status: z.nativeEnum(PaymentStatus)
})
