import Cart from "../model/cart.model";
import { CartInfo, CartItem } from "../types/cart.types";

export class CartRepository{
    async createCart(cartInfo: CartInfo){
        return await Cart.create(cartInfo)
    }

    async getCartItem(userId: string, itemId: string){
        return await Cart.findOne({customer: userId, 'items.productVariant': itemId})
    }

    async getCartByUserId(userId: string){
        return await Cart.findOne({customer: userId}).populate({path: 'items', populate: {path: 'productVariant', select: 'price color stock images'}})
    }

    async addItemToCart(itemId: CartItem, userId: string){
        return await Cart.findOneAndUpdate(
            {customer: userId}, 
            {$push: {items: itemId}},
            {new: true}
        )
    }

    async removeItemFromCart(itemId: string, userId: string){
        return await Cart.findOneAndUpdate(
            {customer: userId},
            {$pull: {items: {productVariant: itemId}}},
            {new: true}
        )
    }

    async updateQuantity(quantity: number, userId: string, itemId: string){
        return await Cart.findOneAndUpdate(
            {customer: userId, 'items.productVariant': itemId},
            {$set: {'items.$.quantity': quantity}},
            {new: true}
        )
    }

    async resetCart(userId: string){
        return await Cart.findOneAndUpdate(
            {customer: userId},
            {$set:{
                items: []
            }},
            {new: true}
        )
    }
}