import { Schema } from "mongoose";
import { CartItem } from "./cart.types";

export enum PaymentMethod{
    Esewa="e-sewa",
    Khalti = "khalti",
    COD = "cash-on-delivery"
}

export enum PaymentStatus{
    UnPaid = "unpaid",
    Paid = "paid"
}

export enum AdminOrderStatus{
    Delivered = "delivered",
    FailedDelivery = "faildelivery"
}

export enum SellerOrderStatus{
    Pending="pending",
    ToPack="to_pack",
    ToArrangeShipment = "to_arrange_shipment",
    ToHandOver = "to_handover",
    Shipping = "shipping"
}

export enum SellerReturnOrderStatus{
    ReturnAccepted = "return-accepted",
    ReturnRejected = "return-rejected"
}

export enum OrderStatus{
    Canceled = "canceled",
    Pending="pending",
    ToPack="to_pack",
    ToArrangeShipment = "to_arrange_shipment",
    ToHandOver = "to_handover",
    Shipping = "shipping",
    Delivered = "delivered",
    FailedDelivery = "faildelivery",
    ReturnInitialized = "return-initialized",
    ReturnAccepted = "return-accepted",
    ReturnRejected = "return-rejected"
}

export interface DeliverInfo{
    shipping_id?: string,
}

export interface PaymentInfo{
    payment_method?: PaymentMethod,
    payment_status?: PaymentStatus
}


export interface OrderInfo{
    _id: string,
    customer_id: Schema.Types.ObjectId,
    shipping_id: Schema.Types.ObjectId,

    payment_method: PaymentMethod,
    payment_status: PaymentStatus,

    isCanceled:boolean,
    cancelAt:Date,
    isCompleted: boolean,
    
    orderTotal: number,
    order_timeStamp: Date,
}

export interface OrderInputInfo{
    _id?:string, 
    
    customer_id: string,
    shipping_id: string,

    payment_method?: PaymentMethod,
    payment_status?: PaymentStatus,

    isCanceled?:boolean,
    isCompleted?: boolean,
    
    cancelAt?: Date,
    orderTotal?: number,
}

export interface orderFilter{
    isCanceled?: boolean,
    isCompleted?: boolean
}

export interface orderItemFilter{
    order_status?:string
}