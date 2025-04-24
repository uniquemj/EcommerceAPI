import { CartRepository } from "../../repository/cart/cart.repository";
import { ProductRepository } from "../../repository/product/product.repository";
import { VariantRepository } from "../../repository/variant/variant.repository";
import { CartInfo, CartItem } from "../../types/cart.types";
import { VariantInfo } from "../../types/variants.types";
import createHttpError from "../../utils/httperror.utils";
import { VariantServices } from "../variant/variant.services";

export class CartServices{
    

    constructor(private readonly cartRepository: CartRepository,
        private readonly variantServices: VariantServices){}

    getCartByUserId = async(userId: string) =>{
        try{
            const cartExist = await this.cartRepository.getCartByUserId(userId)
            if(!cartExist){
                throw createHttpError.NotFound("Cart for user not found.")
            }
            return cartExist
        }catch(error){
            throw error
        }
    }

    getCartItem = async(userId: string, itemId: string) =>{
        try{
            const cartItem = this.cartRepository.getCartItem(userId, itemId)
            if(!cartItem){
                throw createHttpError.NotFound("Cart Item not found.")
            }
            return cartItem
        }catch(error){
            throw error
        }
    }
    
    addToCart = async(itemId: string, userId: string, quantity: number = 1) =>{
        try{
            const productItem = await this.variantServices.getVariant(itemId) as unknown as VariantInfo

            if(productItem.stock as number < quantity){
                throw createHttpError.BadRequest("Quantity exceeds product stock.")
            }

            if(productItem.stock! < 1){
                throw createHttpError.BadRequest("Product Out of Stock.")
            }

            const cartItem: CartItem = {
                productVariant: itemId,
                quantity: quantity
            }
            
            const cartExist = await this.cartRepository.getCartByUserId(userId)
            if(!cartExist){
                const cart: CartInfo = {
                        customer: userId,
                        items: [cartItem]
                    }

                const result = await this.cartRepository.createCart(cart)
                return result
            }

            const itemExist = await this.cartRepository.getCartItem(userId, itemId) as unknown as CartInfo

            if(productItem.stock as number <= itemExist?.items[0].quantity){
                throw createHttpError.BadRequest("Quantity exceeds product stock.")
            }

            const result = await this.cartRepository.updateQuantity(quantity, userId, itemId)
            if(!result){
                const result = await this.cartRepository.addItemToCart(cartItem, userId)
                return result
            }
            return result

        }catch(error){
            throw error
        }
    }

    removeItemFromCart = async(itemId: string, userId: string) =>{
        try{    
            const itemExist = await this.cartRepository.getCartItem(userId, itemId) as unknown as CartInfo
            if(itemExist.items.length == 0){
                throw createHttpError.NotFound("Cart Item not found.")
            }
            const result = await this.cartRepository.removeItemFromCart(itemId, userId)
            return result
        }catch(error){
            throw error
        }
    }

    updateCart = async(itemId: string, quantity: number, userId: string) =>{
        try{
            const itemExist = await this.cartRepository.getCartItem(userId, itemId)
            if(!itemExist){
                throw createHttpError.NotFound("Cart Item not found.")
            }

            const result = await this.cartRepository.updateQuantity(quantity, userId, itemId) as unknown as CartInfo
            if(result && result.items[0].quantity < 1){
                await this.cartRepository.removeItemFromCart(itemId, userId)
            }
            return result
        }catch(error){
            throw error
        }
    }

    getCartTotal = async(userId: string) =>{
        try{
            const cartExist = await this.cartRepository.getCartByUserId(userId)
            if(!cartExist){
                throw createHttpError.BadRequest("Cart for User not found.")
            }
            
            let cartTotal = 0
            for(let cartItem of cartExist.items){
                const item = await this.variantServices.getVariant(cartItem.productVariant as unknown as string) 
                cartTotal += item?.price! * cartItem.quantity
            }
            return cartTotal
        }catch(error){
            throw error
        }
    }

    resetCart = async(userId: string) =>{
        try{
            const userCart = await this.cartRepository.getCartByUserId(userId)
            if(!userCart){
                throw createHttpError.NotFound("Cart for User not found.")
            }
            const result = await this.cartRepository.resetCart(userId)
            return result
        }catch(error){
            throw error
        }
    }
}