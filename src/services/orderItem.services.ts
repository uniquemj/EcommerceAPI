import { inject, injectable } from "tsyringe";
import { OrderItemRepository } from "../repository/orderitem.repository";
import { orderFilter, orderItemFilter } from "../types/order.types";
import { OrderItemInfo, OrderItemInputInfo } from "../types/orderitem.types";
import { paginationField } from "../types/pagination.types";
import { OrderItemRepositoryInterface } from "../types/repository.types";
import createHttpError from "../utils/httperror.utils";
import { VariantServices } from "./variant.services";

@injectable()
export class OrderItemServices {
    constructor(@inject('OrderItemRepositoryInterface') private readonly orderItemRepository: OrderItemRepositoryInterface, @inject(VariantServices) private readonly variantServices: VariantServices) { }

    createOrderItem = async (orderItemInfo: Partial<OrderItemInputInfo>)=> {
        const result = this.orderItemRepository.createOrderItem(orderItemInfo)
        return result
    }

    getAllOrderItem = async (pagination:paginationField, query: string) => {
        const orderItems = await this.orderItemRepository.getAllOrderItems(pagination, query)
        const count = await this.orderItemRepository.getOrderItemCount({})
        return {count: orderItems.length, orderItems}
    }

    getOrderItemsForAdmin = async(pagination:paginationField) =>{
        const orderItems = await this.orderItemRepository.getOrderItemsForAdmin(pagination)
        return orderItems
    }

    getOrderItemById = async (orderId: string) => {
        const orderItemExist = await this.orderItemRepository.getOrderItemById(orderId)
        if (!orderItemExist) {
            throw createHttpError.NotFound("Order Item with Id not found.")
        }
        return orderItemExist
    }

    getOrderItemList = async (orderId: string, query?: orderItemFilter) => {
        const orderItems = await this.orderItemRepository.getOrderItemList(orderId, query)
        const count = orderItems.length
        return {count: count, orderItems}
    }

    getOrderForSeller = async (userId: string, pagination: paginationField, query?: string) => {
        const orderItems = await this.orderItemRepository.getOrderForSeller(userId, pagination,{order_status: query})
       
        const count = await this.orderItemRepository.getOrderForSellerCount(userId, {order_status: query})
        return {count: count, orderItems}
    }

    updateSellerOrderStatus = async (order_status: string, orderItemId: string) => {
        const orderExist = await this.orderItemRepository.getOrderItemById(orderItemId)

        if (!orderExist) {
            throw createHttpError.NotFound("Order with Id not found.")
        }

        if (orderExist.order_status as unknown as string == 'delivered') {
            throw createHttpError.BadRequest("Order status can't be alter as order is delivered.")
        }

        const result = await this.orderItemRepository.updateOrderItem({ order_status: order_status }, orderItemId)
        return result
    }


    updateAdminOrderStatus = async (order_status: string, orderItemId: string) => {
        const orderExist = await this.orderItemRepository.getOrderItemById(orderItemId)

        if (!orderExist) {
            throw createHttpError.NotFound("Order with Id not found.")
        }

        const result = await this.orderItemRepository.updateOrderItem({ order_status: order_status }, orderItemId)
        return result
    }

    updateOrderReturnInitialize = async (orderItemId: string, return_reason: string) => {
        const orderItemExist = await this.orderItemRepository.getOrderItemById(orderItemId)

        if (!orderItemExist) {
            throw createHttpError.NotFound("Order Item with Id does not exist.")
        }

        if (orderItemExist.order_status as unknown as string != 'delivered') {
            throw createHttpError.BadRequest("Order Item status can't be initiated to return as it's not delivered yet.")
        }
        const updateOrderItemStatus = await this.orderItemRepository.updateOrderItem({ order_status: "return-initialized" , return_reason: return_reason}, orderItemId)
        return updateOrderItemStatus
    }

    updateSellerReturnOrderStatus = async (order_status: string, orderItemId: string) => {

        const orderExist = await this.orderItemRepository.getOrderItemById(orderItemId)

        if (!orderExist) {
            throw createHttpError.NotFound("Order with Id not found.")
        }
        if (orderExist.order_status as unknown as string != 'return-initialized') {
            throw createHttpError.BadRequest("Order Item status can't be alter to return status as order is not initialized for return.")
        }

        const result = await this.orderItemRepository.updateOrderItem({ order_status: order_status }, orderItemId)

        return result
    }

    getSellerOrderCountByDate = async(sellerId: string)=>{
        const result = await this.orderItemRepository.getOrderItemCountByDate(sellerId)
        return result
    }
}