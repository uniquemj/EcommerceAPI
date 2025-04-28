
import { OrderRepository } from "../../repository/order/order.repository";
import { CartItem } from "../../types/cart.types";
import { DeliverInfo, orderFilter, orderItemFilter } from "../../types/order.types";
import createHttpError from "../../utils/httperror.utils";
import { CartServices } from "../cart/cart.services";
import { OrderItemServices } from "../orderItem/orderItem.services";
import { ProductServices } from "../product/product.services";
import { VariantServices } from "../variant/variant.services";

export class OrderServices{

    constructor(private readonly orderRepository: OrderRepository,
        private readonly cartServices: CartServices,
        private readonly orderItemServices: OrderItemServices, 
        private readonly variantServices: VariantServices,
        private readonly productServices: ProductServices
    ){}

    getOrderList = async(query: orderFilter) =>{
        try{
            const orders = await this.orderRepository.getOrderList(query)
            if(orders.length == 0){
                throw createHttpError.NotFound("Order List is Empty.")
            }
            return orders
        }catch(error){
            throw error
        }
    }

    getCustomerOrderList = async(query: orderItemFilter, userId: string) =>{
        try{
            const orderExist = await this.orderRepository.getCustomerOrderList(userId)
            
            if(!orderExist){
                throw createHttpError.NotFound("Order for User not found.")
            }
            const orders =  await Promise.all(orderExist.map(async(order)=>{
                const orderItems = await this.orderItemServices.getOrderItemList(order._id as string, query)

                const orderDetail = {
                    order: order,
                    orderItems: orderItems
                }
                return orderDetail
            }))

            return orders
        }catch(error){
            throw error
        }
    }

    getCustomerOrder = async(orderId: string, userId: string) =>{
        try{
            const orderExist = await this.orderRepository.getCustomerOrder(orderId, userId)

            if(!orderExist){
                throw createHttpError.NotFound("Order for User not found.")
            }

            const orderItems = await this.orderItemServices.getOrderItemList(orderId, {})

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

            const cartExist = await this.cartServices.getCartByUserId(userId)

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
                const product_id = await this.variantServices.getVariantSeller(item.productVariant)
                await this.variantServices.updateStock(item.productVariant, -item.quantity)
                const product = await this.productServices.getProductById(product_id as unknown as string)
                
                const orderItemInfo = {
                    order_id: order._id as string,
                    item: orderItem,
                    seller_id: product.seller as unknown as string
                }

                await this.orderItemServices.createOrderItem(orderItemInfo)
            })

            await this.cartServices.resetCart(userId)
            return order
        }catch(error){
            throw error
        }
    }



    cancelOrder = async(order_id: string, userId: string) =>{
        try{
            const orderExist = await this.orderRepository.getOrderById(order_id)
            
            if(!orderExist){
                throw createHttpError.NotFound("Order with Id not found.")
            }
            if(orderExist.customer_id as unknown as string != userId){
                throw createHttpError.NotFound("Order not found.")
            }

            const orderItems = await this.orderItemServices.getOrderItemList(order_id,{})

            const itemStatus = orderItems.some((item) => item.order_status =='pending')

            if(!itemStatus){
                throw createHttpError.BadRequest("Order can't be cancelled.")
            }

            orderItems.forEach(async(item)=>{
                await this.orderItemServices.updateSellerOrderStatus("canceled", item._id as string)
            })

            const result = await this.orderRepository.updateOrder(order_id, {isCanceled: true, cancelAt: Date.now() as unknown as Date})
            return result
        }catch(error){
            throw error
        }
    }

    completeOrder = async(order_id: string) =>{
        try{    
            const orderExist = await this.orderRepository.getOrderById(order_id)
            if(!orderExist){
                throw createHttpError.NotFound("Order of Id not found.")
            }
            const orderItems = await this.orderItemServices.getOrderItemList(order_id,{})

            const itemStatus = orderItems.every((item)=>item.order_status =='delivered')
            
            if(!itemStatus){
                throw createHttpError.BadRequest("Order can't be set to complete as order are still need to be delivered.")
            }

            const result = await this.orderRepository.updateOrder(order_id, {isCompleted: true})
            return result
        }catch(error){
            throw error
        }
    }
}