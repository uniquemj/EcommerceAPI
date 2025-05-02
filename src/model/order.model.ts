import {Schema, Model, model, Document} from 'mongoose'
import { PaymentMethod, PaymentStatus } from '../types/order.types'



interface OrderDocument extends Document{
    customer_id: Schema.Types.ObjectId,
    shipping_id: Schema.Types.ObjectId,

    payment_method: PaymentMethod,
    payment_status: PaymentStatus,
    
    isCanceled: boolean,
    cancelAt: Date,

    isCompleted: boolean,
    
    orderTotal: number,
    order_timeStamp: Date,
}

const orderSchema: Schema<OrderDocument> = new Schema({
    customer_id: {type: Schema.Types.ObjectId, ref: 'customer'},
    shipping_id: {type: Schema.Types.ObjectId, ref: 'shipmentAddress'},

    payment_method: {type: String, enum: Object.values(PaymentMethod), default: PaymentMethod.COD},
    payment_status: {type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.UnPaid},

    isCanceled: {type: Boolean, default: false},
    cancelAt: {type: Date},

    isCompleted: {type: Boolean, default: false},

    orderTotal: {type: Number, min: 0},
    order_timeStamp: {type: Date, default: Date.now},
})

const Order: Model<OrderDocument> = model('order', orderSchema)

export default Order