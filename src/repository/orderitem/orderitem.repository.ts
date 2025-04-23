import OrderItem from "../../model/orderitem/orderitem.model";
import { OrderItemInfo } from "../../types/orderitem.types";

export class OrderItemRepository{
    async createOrderItem(orderItemInfo: OrderItemInfo){
        return await OrderItem.create(orderItemInfo)
    }

    async getOrderItemById(orderId: string){
        return await OrderItem.findById(orderId).populate({path: "item", populate: {path: "productVariant", populate: {path: "product", select: "_id seller name"}}})
    }

    async getOrderItemList(orderId: string){
        return await OrderItem.find({order_id: orderId}).populate({path: "item", populate: {path: "productVariant", populate: {path: "product", select: "_id seller name"}}})
    }

    // .populate({path:'item': populate:{path: 'productVariant'}})

    async updateOrderStatus(order_status: string, orderItemId: string){
        return await OrderItem.findByIdAndUpdate(orderItemId, {order_status: order_status}, {new: true})
    }
}