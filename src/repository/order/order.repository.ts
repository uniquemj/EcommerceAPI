import Order from "../../model/order/order.model";
import { OrderInfo } from "../../types/order.types";

export class OrderRepository{
    async getCustomerOrder(userId: string){
        return await Order.findOne({customer_id: userId}).select('_id customer_id shipping_id payment_method payment_status orderTotal order_timeStamp')
    }
    
    async getOrderById(orderId: string){
        return await Order.findById(orderId)
    }
    async createOrder(orderInfo: OrderInfo){
        return await Order.create(orderInfo)
    }
}