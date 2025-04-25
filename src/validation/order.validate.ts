import {z} from 'zod'
import {PaymentMethod, PaymentStatus, SellerOrderStatus } from '../types/order.types'

export const deliveryInfoSchema = z.object({
    shipping_id: z.string(),
})

export const paymentMethodSchema = z.object({
    payment_method: z.nativeEnum(PaymentMethod),
    payment_status: z.nativeEnum(PaymentStatus)
})


export const sellerOrderStatusSchema = z.object({
    order_status: z.nativeEnum(SellerOrderStatus)
})

export const adminOrderStatusSchema = z.object({
    order_status: z.nativeEnum(SellerOrderStatus)
})