import { OrderStatus, PaymentMethod, PaymentStatus } from "../model/order/order.model";
import { CartItem } from "./cart.types";

export interface DeliverInfo{
    full_name: string,
    email: string,
    phone_number: string,
    region: string,
    city: string,
    address: string,
}

export interface PaymentInfo{
    payment_method?: PaymentMethod,
    payment_status?: PaymentStatus
}

export interface OrderInfo extends DeliverInfo, PaymentInfo{
    customer: string,
    order_status?: OrderStatus,
    orderCompleted?: boolean,
    orderItems: CartItem[],
    orderTotal: number,
    order_timeStamp?: Date,
    isCancelled?: boolean
}