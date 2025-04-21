import Order from "../../model/order/order.model";
import { OrderInfo } from "../../types/order.types";

export class OrderRepository{
    async getOrder(userId: string){
        return await Order.findOne({customer: userId})
    }
    
    async createOrder(orderInfo: OrderInfo){
        return await Order.create(orderInfo)
    }
}