import { OrderItemRepository } from "../../repository/orderitem/orderitem.repository";
import { OrderItemInfo } from "../../types/orderitem.types";
import createHttpError from "../../utils/httperror.utils";


export class OrderItemServices{
    constructor(private readonly orderItemRepository: OrderItemRepository){}

    createOrderItem = async(orderItemInfo: OrderItemInfo) =>{
        try{
            const result = this.orderItemRepository.createOrderItem(orderItemInfo)
            return result
        }catch(error){
            throw error
        }
    }

    getOrderItemById = async(orderId: string) =>{
        try{
            const orderItemExist = await this.orderItemRepository.getOrderItemById(orderId)
            if(!orderItemExist){
                throw createHttpError.NotFound("Order Item with Id not found.")
            }
            return orderItemExist
        }catch(error){
            throw error
        }
    }

    getOrderItemList = async(orderId: string) =>{
        try{
            const orderItems = await this.orderItemRepository.getOrderItemList(orderId)
            return orderItems
        }catch(error){
            throw error
        }
    }
    
    getOrderForSeller = async(userId: string) =>{
        try{
            const orderItems = await this.orderItemRepository.getOrderForSeller(userId)
            if(orderItems.length == 0){
                throw createHttpError.NotFound("No order received.")
            }
            return orderItems
        }catch(error){
            throw error
        }
    }

    updateOrderStatus = async(order_status: string, orderItemId: string) =>{
        try{
            const orderExist = await this.orderItemRepository.getOrderItemById(orderItemId)

            if(!orderExist){
                throw createHttpError.NotFound("Order with Id not found.")
            }
            
            if(!orderExist.order_status as unknown as string == 'delivered'){
                throw createHttpError.BadRequest("Order status can't be alter as order is delivered.")
            }

            const result = await this.orderItemRepository.updateOrderItem({order_status: order_status}, orderItemId)
            return result
        }catch(error){
            throw error
        }
    }

}