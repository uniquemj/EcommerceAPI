import { CartRepository } from "../../repository/cart/cart.repository";
import { OrderRepository } from "../../repository/order/order.repository";
import { OrderItemRepository } from "../../repository/orderitem/orderitem.repository";
import { ShipmentAddressRepository } from "../../repository/shipmentAddress/shipmentAddress.repository";
import { CartItem } from "../../types/cart.types";
import { DeliverInfo } from "../../types/order.types";
import { Helper } from "../../utils/helper.utils";
import createHttpError from "../../utils/httperror.utils";
import { CartServices } from "../cart/cart.services";

export class OrderServices{
    private readonly orderRepository: OrderRepository
    private readonly cartRepository: CartRepository
    private readonly cartServices: CartServices
    private readonly orderItemRepository: OrderItemRepository   
    private readonly helper: Helper

    constructor(){
        this.orderRepository = new OrderRepository()
        this.cartRepository = new CartRepository()
        this.cartServices = new CartServices()
        this.orderItemRepository = new OrderItemRepository()
    
        this.helper = new Helper()
    }

    getCustomerOrder = async(userId: string) =>{
        try{
            const orderExist = await this.orderRepository.getCustomerOrder(userId)

            if(!orderExist){
                throw createHttpError.NotFound("Order for User not found.")
            }

            const orderItems = await this.orderItemRepository.getOrderItemList(orderExist._id as string)

            const orderResponse = {
                order: orderExist,
                orderItems: orderItems
            }
            return orderResponse
        }catch(error){
            throw error
        }
    }

    createOrder = async(deliveryInfo: DeliverInfo, userId: string) =>{
        try{
            

            const cartExist = await this.cartRepository.getCartByUserId(userId)

            if(!cartExist){
                throw createHttpError.BadRequest("Cart for User not found.")
            }
            const cartItems = cartExist.items as unknown as CartItem[]

            const orderTotal = await this.cartServices.getCartTotal(userId)

            const orderInfo = {
                shipping_id: deliveryInfo.shipping_id as string,
                customer_id: userId,
                orderTotal: orderTotal
            }
            
            const order = await this.orderRepository.createOrder(orderInfo)

            cartItems.forEach(async(item)=>{
                const orderItem = {
                    productVariant: item.productVariant,
                    quantity: item.quantity
                }
                const variantSeller = await this.helper.getVariantSeller(item.productVariant)

                const orderItemInfo = {
                    order_id: order._id as string,
                    item: orderItem,
                    seller_id: variantSeller
                }

                await this.orderItemRepository.createOrderItem(orderItemInfo)
            })

            await this.cartRepository.resetCart(userId)
            return order
        }catch(error){
            throw error
        }
    }

    getOrderForSeller = async(sellerId: string) =>{
        try{
            const orders = await this.orderItemRepository.getOrderForSeller(sellerId)
            if(orders.length == 0){
                throw createHttpError.NotFound("No order received.")
            }
            return orders
        }catch(error){
            throw error
        }
    }

    updateOrderStatus = async(order_status: string, orderItemId: string, userId: string) =>{
        try{
            const orderExist = await this.orderItemRepository.getOrderItemById(orderItemId)

            if(!orderExist){
                throw createHttpError.NotFound("Order with Id not found.")
            }
            
            if(!orderExist.order_status as unknown as string == 'delivered'){
                throw createHttpError.BadRequest("Order status can't be alter as order is delivered.")
            }
            
            if(userId != orderExist.seller_id as unknown as string){
                throw createHttpError.BadRequest("Product with seller doesn't exist")
            }

            const result = await this.orderItemRepository.updateOrderStatus(order_status, orderItemId)
            return result
        }catch(error){
            throw error
        }
    } 
}