import {Schema, Model, model, Document} from 'mongoose';

interface CartItem{
    productVariant: Schema.Types.ObjectId,
    quantity: number
}

interface CartDocument extends Document{
    customer: Schema.Types.ObjectId,
    items: CartItem[]
}

const cartSchema: Schema<CartDocument> = new Schema({
    customer: {type: Schema.Types.ObjectId, ref: 'customer'},
    items: [
        {
            productVariant: {type: Schema.Types.ObjectId, ref: 'variant'},
            quantity: {type: Number, min: 0, default: 1}
        }
    ]
})

const Cart: Model<CartDocument> = model('cart', cartSchema)

export default Cart