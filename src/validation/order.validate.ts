import {z} from 'zod'
import { OrderStatus, PaymentMethod, PaymentStatus } from '../types/order.types'

export const deliveryInfoSchema = z.object({
    shipping_id: z.string(),
})

export const paymentMethodSchema = z.object({
    payment_method: z.nativeEnum(PaymentMethod),
    payment_status: z.nativeEnum(PaymentStatus)
})


export const orderStatusSchema = z.object({
    order_status: z.nativeEnum(OrderStatus)
})