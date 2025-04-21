import { CartRepository } from "../../repository/cart/cart.repository";
import { OrderRepository } from "../../repository/order/order.repository";
import { CartItem } from "../../types/cart.types";
import { DeliverInfo } from "../../types/order.types";
import createHttpError from "../../utils/httperror.utils";
import { CartServices } from "../cart/cart.services";

export class OrderServices{
    private readonly orderRepository: OrderRepository
    private readonly cartRepository: CartRepository
    private readonly cartServices: CartServices

    constructor(){
        this.orderRepository = new OrderRepository()
        this.cartRepository = new CartRepository()
        this.cartServices = new CartServices()
    }

    getOrder = async(userId: string) =>{
        try{
            const orderExist = await this.orderRepository.getOrder(userId)
            if(!orderExist){
                throw createHttpError.NotFound("Order for User not found.")
            }
            return orderExist
        }catch(error){
            throw error
        }
    }

    createOrder = async(deliveryInfo: DeliverInfo, userId: string) =>{
        try{
            const {full_name, email, phone_number, region, city, address} = deliveryInfo

            const cartExist = await this.cartRepository.getCartByUserId(userId)

            if(!cartExist){
                throw createHttpError.BadRequest("Cart for User not found.")
            }

            const cartTotal = await this.cartServices.getCartTotal(userId)
            const cartItems = cartExist.items as unknown as CartItem[]
            const orderInfo = {
                full_name,
                email,
                phone_number, 
                region,
                city,
                address,
                customer: userId,
                orderItems: cartItems,
                orderTotal: cartTotal
            }

            const order = await this.orderRepository.createOrder(orderInfo)
            await this.cartRepository.resetCart(userId)
            return order
        }catch(error){
            throw error
        }
    }
}