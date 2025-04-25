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
    FailedDelivery = "faildelivery",
    ReturnOrReplace = "return-or-replace"
}

export enum SellerOrderStatus{
    Canceled = "canceled",
    Pending="pending",
    ToPack="to_pack",
    ToArrangeShipment = "to_arrange_shipment",
    ToHandOver = "to_handover",
    Shipping = "shipping",
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
    ReturnOrReplace = "return-or-replace"
}

export interface DeliverInfo{
    shipping_id?: string,
}

export interface PaymentInfo{
    payment_method?: PaymentMethod,
    payment_status?: PaymentStatus
}

export interface OrderInfo{
    customer_id?: string,
    shipping_id?: string,

    payment_method?: PaymentMethod,
    payment_status?: PaymentStatus,

    isCanceled?:boolean,
    cancelAt?:Date,
    isCompleted?: boolean,
    
    orderTotal?: number,
    order_timeStamp?: Date,
}

export interface orderItemFilter{
    status?:string,
    order_status?:string
}