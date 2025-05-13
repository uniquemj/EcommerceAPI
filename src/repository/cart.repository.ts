import { injectable } from "tsyringe";
import Cart from "../model/cart.model";
import { CartInfo, CartInputInfo, CartInputItem, CartItem } from "../types/cart.types";
import { CartRepositoryInterface } from "../types/repository.types";

@injectable()
export class CartRepository implements CartRepositoryInterface{
    async createCart(cartInfo: CartInputInfo):Promise<CartInfo>{
        return await Cart.create(cartInfo)
    }

    async getCartItem(userId: string, itemId: string):Promise<CartInfo | null>{
        return await Cart.findOne({customer: userId, 'items.productVariant': itemId})
    }

    async getCartByUserId(userId: string):Promise<CartInfo | null>{
        return await Cart.findOne({customer: userId})
        .populate({path: 'items', populate: {path: 'productVariant', select: 'price color stock images', populate: {path: 'product', select: 'seller name'}}})
    }

    async addItemToCart(itemId: CartInputItem, userId: string): Promise<CartInfo | null>{
        return await Cart.findOneAndUpdate(
            {customer: userId}, 
            {$push: {items: itemId}},
            {new: true}
        )
    }

    async removeItemFromCart(itemId: string, userId: string): Promise<CartInfo | null>{
        return await Cart.findOneAndUpdate(
            {customer: userId},
            {$pull: {items: {productVariant: itemId}}},
            {new: true}
        )
    }

    async updateQuantity(quantity: number, userId: string, itemId: string): Promise<CartInfo | null>{
        return await Cart.findOneAndUpdate(
            {customer: userId, 'items.productVariant': itemId},
            {$set: {'items.$.quantity': quantity}},
            {new: true}
        )
    }

    async resetCart(userId: string): Promise<void>{
        await Cart.findOneAndUpdate(
            {customer: userId},
            {$set:{
                items: []
            }},
            {new: true}
        )
    }
}