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

export enum OrderStatus{
    Cancel="cancel",
    Pending="pending",
    ToPack="to_pack",
    ToArrangeShipment = "to_arrange_shipment",
    ToHandOver = "to_handover",
    Shipping = "shipping",
    Delivered = "delivered",
    FailedDelivery = "faildelivery",
    ReturnAndRefund = "return&refund"
}

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

export interface OrderInfo{
    customer_id: string,
    shipping_id: string,

    payment_method?: PaymentMethod,
    payment_status?: PaymentStatus,

    orderTotal: number,
    order_timeStamp?: Date,
}