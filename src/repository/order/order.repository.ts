import Order from "../../model/order/order.model";
import { orderFilter, OrderInfo } from "../../types/order.types";

export class OrderRepository{

    async getOrderList(query: orderFilter){
        return await Order.find({...query})
    }
    async getCustomerOrderList(userId: string){
        return await Order.find({customer_id: userId}).select('-__v')
    }

    async getCustomerOrder(orderId: string, userId: string){
        return await Order.find({_id: orderId, customer_id: userId})
    }
    
    async getOrderById(orderId: string){
        return await Order.findById(orderId)
    }

    async createOrder(orderInfo: OrderInfo){
        return await Order.create(orderInfo)
    }

    async updateOrder(orderId: string,updateInfo: OrderInfo){
        return await Order.findByIdAndUpdate(orderId, updateInfo, {new: true})
    }
}