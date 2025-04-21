import { CartRepository } from "../../repository/cart/cart.repository";
import { ProductRepository } from "../../repository/product/product.repository";
import { VariantRepository } from "../../repository/variant/variant.repository";
import { CartInfo, CartItem } from "../../types/cart.types";
import { VariantInfo } from "../../types/variants.types";
import createHttpError from "../../utils/httperror.utils";

export class CartServices{
    private readonly cartRepository: CartRepository
    private readonly variantRepository: VariantRepository
    private readonly productRepository: ProductRepository

    constructor(){
        this.cartRepository = new CartRepository()
        this.variantRepository = new VariantRepository()
        this.productRepository = new ProductRepository()
    }

    getCart = async(userId: string) =>{
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

    addToCart = async(itemId: string, userId: string, quantity: number = 1) =>{
        try{
            const productItem = await this.variantRepository.getVariant(itemId) as unknown as VariantInfo

            if(!productItem){
                throw createHttpError.NotFound("Product Item not found.")
            }

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

    updateQuantity = async(itemId: string, quantity: number, userId: string) =>{
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
}