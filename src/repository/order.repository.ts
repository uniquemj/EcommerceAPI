import { injectable } from "tsyringe";
import Order from "../model/order.model";
import { OrderCountFilter, orderFilter, OrderInfo, OrderInputInfo } from "../types/order.types";
import { paginationField } from "../types/pagination.types";
import { OrderRepositoryInterface } from "../types/repository.types";

@injectable()
export class OrderRepository implements OrderRepositoryInterface{

    async getOrderList(pagination: paginationField, query: orderFilter):Promise<OrderInfo[]>{
        return await Order.find({...query})
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
    }

    async getAllOrderList (pagination: paginationField):Promise<OrderInfo[]>{
        return await Order.find({isCanceled: false})
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .sort('-order_timeStamp')
        .select('-__v')
        .populate({path: 'shipping_id', select: '-isDeleted'})
    }

    async getCustomerOrderList(userId: string, pagination: paginationField, query?: orderFilter): Promise<OrderInfo[]|[]>{
        return await Order.find({customer_id: userId, isCanceled: false, ...query})
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .sort('-order_timeStamp')
        .select('-__v')
        .populate({path: 'shipping_id', select: '-isDeleted'})
    }

    async getOrderCounts(countFilter: OrderCountFilter): Promise<number>{
        return await Order.countDocuments({...countFilter})
    }

    async getCustomerOrder(orderId: string, userId: string): Promise<OrderInfo | null>{
        return await Order.findOne({_id: orderId, customer_id: userId}).populate({path: 'shipping_id'})
    }
    
    async getOrderById(orderId: string): Promise<OrderInfo | null>{
        return await Order.findById(orderId).populate({path: 'shipping_id'})
    }

    async createOrder(orderInfo: OrderInputInfo): Promise<OrderInfo>{
        return await Order.create(orderInfo)
    }

    async updateOrder(orderId: string,updateInfo: Partial<OrderInputInfo>): Promise<OrderInfo | null>{
        return await Order.findByIdAndUpdate(orderId, updateInfo, {new: true})
    }
}