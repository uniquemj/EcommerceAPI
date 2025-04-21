import {Schema, Model, model, Document} from 'mongoose'
import { CartItem } from '../../types/cart.types'

export enum OrderStatus{
    Pending="pending",
    ToPack="to_pack",
    ToArrangeShipment = "to_arrange_shipment",
    ToHandOver = "to_handover",
    Shipping = "shipping",
    Delivered = "delivered",
    FailedDelivery = "faildelivery",
    ReturnAndRefund = "return&refund"
}

export enum PaymentMethod{
    Esewa="e-sewa",
    Khalti = "khalti",
    COD = "cash-on-delivery"
}

export enum PaymentStatus{
    UnPaid = "unpaid",
    Paid = "paid"
}

interface OrderDocument extends Document{
    full_name: string,
    email: string,
    phone_number: string,
    region: string,
    city: string,
    address: string,

    customer: Schema.Types.ObjectId,

    payment_method: PaymentMethod,
    payment_status: PaymentStatus,
    
    order_status: OrderStatus,
    orderCompleted: boolean,
    orderItems: CartItem[],
    orderTotal: number,
    order_timeStamp: Date,
    isCancelled: boolean
}

const orderSchema: Schema<OrderDocument> = new Schema({
    full_name: {type: String},
    email: {type: String},
    phone_number: {type: String, minlength: 10},
    region : {type: String},
    city: {type: String},
    address: {type: String},

    payment_method: {type: String, enum: PaymentMethod, default: PaymentMethod.COD},
    payment_status: {type: String, enum: PaymentStatus, default: PaymentStatus.UnPaid},

    customer: {type: Schema.Types.ObjectId, ref: 'customer'},
    order_status: {type: String, enum: OrderStatus, default: OrderStatus.Pending},
    orderCompleted: {type: Boolean, default: false},
    orderItems: [
        {
            productVariant: {type: Schema.Types.ObjectId, ref: "variant"},
            quantity: {type: Number, min: 0, default: 1}
        }
    ],
    orderTotal: {type: Number, min: 0},
    order_timeStamp: {type: Date, default: Date.now},
    isCancelled: {type: Boolean, default: false}
})

const Order: Model<OrderDocument> = model('order', orderSchema)

export default Order