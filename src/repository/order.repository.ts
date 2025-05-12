import Order from "../model/order.model";
import { orderFilter, OrderInfo, OrderInputInfo } from "../types/order.types";
import { OrderRepositoryInterface } from "../types/repository.types";

export class OrderRepository implements OrderRepositoryInterface{

    async getOrderList(query: orderFilter):Promise<OrderInfo[]>{
        return await Order.find({...query})
    }
    async getCustomerOrderList(userId: string): Promise<OrderInfo[]|[]>{
        return await Order.find({customer_id: userId}).select('-__v')
    }

    async getCustomerOrder(orderId: string, userId: string): Promise<OrderInfo[]|[]>{
        return await Order.find({_id: orderId, customer_id: userId})
    }
    
    async getOrderById(orderId: string): Promise<OrderInfo | null>{
        return await Order.findById(orderId)
    }

    async createOrder(orderInfo: OrderInputInfo): Promise<OrderInfo>{
        return await Order.create(orderInfo)
    }

    async updateOrder(orderId: string,updateInfo: Partial<OrderInputInfo>): Promise<OrderInfo | null>{
        return await Order.findByIdAndUpdate(orderId, updateInfo, {new: true})
    }
}