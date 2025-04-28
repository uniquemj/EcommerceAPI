import { OrderItemRepository } from "../../repository/orderitem/orderitem.repository";
import { orderItemFilter } from "../../types/order.types";
import { OrderItemInfo } from "../../types/orderitem.types";
import createHttpError from "../../utils/httperror.utils";
import { VariantServices } from "../variant/variant.services";


export class OrderItemServices{
    constructor(private readonly orderItemRepository: OrderItemRepository, private readonly variantServices: VariantServices){}

    createOrderItem = async(orderItemInfo: OrderItemInfo) =>{
        try{
            const result = this.orderItemRepository.createOrderItem(orderItemInfo)
            return result
        }catch(error){
            throw error
        }
    }

    getAllOrderItem = async(query: orderItemFilter) =>{
        try{
            const orderItems = await this.orderItemRepository.getAllOrderItems(query)
            if(orderItems.length == 0){
                throw createHttpError.NotFound("Order Items list is empty.")
            }
            return orderItems
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

    getOrderItemList = async(orderId: string, query: orderItemFilter) =>{
        try{
            const orderItems = await this.orderItemRepository.getOrderItemList(orderId, query)
            return orderItems
        }catch(error){
            throw error
        }
    }
    
    getOrderForSeller = async(userId: string, query: orderItemFilter) =>{
        try{
            const orderItems = await this.orderItemRepository.getOrderForSeller(userId, query)
            if(orderItems.length == 0){
                throw createHttpError.NotFound("No order received.")
            }
            return orderItems
        }catch(error){
            throw error
        }
    }

    updateSellerOrderStatus = async(order_status: string, orderItemId: string) =>{
        try{
            const orderExist = await this.orderItemRepository.getOrderItemById(orderItemId)

            if(!orderExist){
                throw createHttpError.NotFound("Order with Id not found.")
            }
            
            if(orderExist.order_status as unknown as string != 'delivered'){
                throw createHttpError.BadRequest("Order status can't be alter as order is delivered.")
            }

            const result = await this.orderItemRepository.updateOrderItem({order_status: order_status}, orderItemId)
            return result
        }catch(error){
            throw error
        }
    }

    
    updateAdminOrderStatus = async(order_status: string, orderItemId: string) =>{
        try{
            console.log(orderItemId)
            const orderExist = await this.orderItemRepository.getOrderItemById(orderItemId)
            console.log(orderExist)

            if(!orderExist){
                throw createHttpError.NotFound("Order with Id not found.")
            }
            
            const result = await this.orderItemRepository.updateOrderItem({order_status: order_status}, orderItemId)
            return result
        }catch(error){
            throw error
        }
    }
    
    updateOrderReturnInitialize = async(orderItemId: string) =>{
        try{
            const orderItemExist = await this.orderItemRepository.getOrderItemById(orderItemId)
            
            if(!orderItemExist){
                throw createHttpError.NotFound("Order Item with Id does not exist.")
            }
            
            const updateOrderItemStatus = await this.orderItemRepository.updateOrderItem({order_status: "return-initialized"}, orderItemId)
            return updateOrderItemStatus
        }catch(error){
            throw error
        }
    }
    
    updateSellerReturnOrderStatus = async(order_status: string, orderItemId: string) =>{
        try{
            const orderExist = await this.orderItemRepository.getOrderItemById(orderItemId)
    
            if(!orderExist){
                throw createHttpError.NotFound("Order with Id not found.")
            }
            if(orderExist.order_status as unknown as string != 'return-initialized'){
                throw createHttpError.BadRequest("Order Item status can't be alter to return status as order is not initialized for return.")
            }
            
            if(order_status == 'return-accepted'){
                await this.variantServices.updateStock(orderExist.item.productVariant, orderExist.item.quantity)
            }
            
            const result = await this.orderItemRepository.updateOrderItem({order_status: order_status}, orderItemId)

            return result
        }catch(error){
            throw error
        }
    }
}