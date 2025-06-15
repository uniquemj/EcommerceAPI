import {Schema, Model, model, Document} from 'mongoose';
import { CartItem } from '../types/cart.types';
import { OrderStatus } from '../types/order.types';

interface OrderItemDocument extends Document{
    _id: string,
    order_id: Schema.Types.ObjectId,
    item: CartItem,
    
    order_status : OrderStatus,
    seller_id: Schema.Types.ObjectId,
    return_reason: string
}


const orderItemSchema: Schema<OrderItemDocument> = new Schema({
    order_id: {type: Schema.Types.ObjectId, ref: 'order'},
    item: {
        productVariant: {type: Schema.Types.ObjectId, ref: 'variant'},
        quantity: {type: Number, min: 0, default: 1}
    },
    seller_id: {type: Schema.Types.ObjectId, ref: 'seller'},
    order_status: {type: String, enum: Object.values(OrderStatus), default: OrderStatus.Pending},
    return_reason: {type: String, min: 10, max: 150}
},{timestamps: true})

const OrderItem : Model<OrderItemDocument> = model('orderitem', orderItemSchema)

export default OrderItem
