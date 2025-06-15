import { inject, injectable } from "tsyringe";
import { CartRepository } from "../repository/cart.repository";
import { CartInfo, CartInputInfo, CartInputItem, CartItem, CartTotal } from "../types/cart.types";
import { CartRepositoryInterface } from "../types/repository.types";
import { VariantInfo } from "../types/variants.types";
import createHttpError from "../utils/httperror.utils";
import { VariantServices } from "./variant.services";
import { DELIVERYFEE } from "../constant/deliveryFee.constant";

@injectable()
export class CartServices {

    constructor(@inject('CartRepositoryInterface') private readonly cartRepository: CartRepositoryInterface,
        @inject(VariantServices) private readonly variantServices: VariantServices) { }

    getCartByUserId = async (userId: string) => {
        const cartExist = await this.cartRepository.getCartByUserId(userId)
        return cartExist
    }

    getCartItem = async (userId: string, itemId: string) => {
        const cartItem = this.cartRepository.getCartItem(userId, itemId)
        if (!cartItem) {
            throw createHttpError.NotFound("Cart Item not found.")
        }
        return cartItem
    }

    addToCart = async (itemId: string, userId: string, quantity: number = 1) => {

        const productItem = await this.variantServices.getVariant(itemId)

        if (productItem.stock! < 1) {
            throw createHttpError.BadRequest("Product Out of Stock.")
        }

        if (productItem.stock as number < quantity) {
            throw createHttpError.BadRequest("Quantity exceeds product stock.")
        }


        const cartItem: CartInputItem = {
            productVariant: productItem._id,
            quantity: quantity
        }

        const cartExist = await this.cartRepository.getCartByUserId(userId)

        if (!cartExist) {
            const cart: CartInputInfo = {
                customer: userId,
                items: [cartItem]
            }

            const result = await this.cartRepository.createCart(cart)
            return result
        }

        const itemExist = await this.cartRepository.getCartItem(userId, itemId)
        
        if (itemExist && productItem.stock as number <= itemExist.items[0].quantity) {
            throw createHttpError.BadRequest("Quantity exceeds product stock.")
        }

        const result = await this.cartRepository.updateQuantity(quantity, userId, itemId)
        if (!result) {
            const result = await this.cartRepository.addItemToCart(cartItem, userId)
            return result
        }
        return result
    }

    removeItemFromCart = async (itemId: string, userId: string) => {
        const itemExist = await this.cartRepository.getCartItem(userId, itemId)
        if (!itemExist) {
            throw createHttpError.NotFound("Cart Item not found.")
        }

        const result = await this.cartRepository.removeItemFromCart(itemId, userId)
        return result
    }

    updateCart = async (itemId: string, quantity: number, userId: string) => {
        const itemExist = await this.cartRepository.getCartItem(userId, itemId)

        if (!itemExist) {
            throw createHttpError.NotFound("Cart Item not found.")
        }
        const productItem = await this.variantServices.getVariant(itemId) as unknown as VariantInfo

        if (productItem.stock! < 1) {
            throw createHttpError.BadRequest("Product Out of Stock.")
        }

        if (productItem.stock!< quantity) {
            throw createHttpError.BadRequest("Quantity exceeds product stock.")
        }
        const result = await this.cartRepository.updateQuantity(quantity, userId, itemId) as unknown as CartInfo

        const cartItem = await this.cartRepository.getCartItem(userId, itemId)
        const filterItem = cartItem?.items.filter((item)=>String(item.productVariant) == itemId)
 
        if (filterItem?.length && filterItem[0].quantity < 1) {
            await this.cartRepository.removeItemFromCart(itemId, userId)
        }
        return result
    }

    getCartTotal = async (userId: string): Promise<CartTotal> => {
        const cartExist = await this.cartRepository.getCartByUserId(userId)
        if (!cartExist) {
            throw createHttpError.BadRequest("Cart for User not found.")
        }

        let cartTotal = 0
        for(const item of cartExist.items){
            const variant = await this.variantServices.getVariant(item.productVariant as unknown as string)
            if(variant.stock > 0){
                cartTotal += variant.price * item.quantity
            }
        }
        return {delivery_fee: DELIVERYFEE, subTotal: cartTotal, total: cartTotal + DELIVERYFEE}
    }

    resetCart = async (userId: string) => {
        const userCart = await this.cartRepository.getCartByUserId(userId)
        if (!userCart) {
            throw createHttpError.NotFound("Cart for User not found.")
        }
        const result = await this.cartRepository.resetCart(userId)
        return result
    }
}