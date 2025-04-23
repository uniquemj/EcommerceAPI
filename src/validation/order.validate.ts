import {z} from 'zod'
import { OrderStatus, PaymentMethod, PaymentStatus } from '../types/order.types'

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


export const orderStatusSchema = z.object({
    order_status: z.nativeEnum(OrderStatus)
})