import OrderItem from "../../model/orderitem/orderitem.model";
import { OrderItemInfo } from "../../types/orderitem.types";

export class OrderItemRepository{
    async createOrderItem(orderItemInfo: OrderItemInfo){
        return await OrderItem.create(orderItemInfo)
    }

    async getOrderItemById(orderId: string){
        return await OrderItem.findById(orderId).populate({path: "item", populate: {path: "productVariant", populate: {path: "product", select: "_id name"}}})
    }

    async getOrderItemList(orderId: string){
        return await OrderItem.find({order_id: orderId}).populate({path: "item", populate: {path: "productVariant", populate: {path: "product", select: "_id name"}}})
    }

    async getOrderForSeller(userId: string){
        const productVariantPopulate = {path: "item", populate: {path: "productVariant", select: "-__v", populate: {path: "product", select: "_id name"}}}
        const customerPopulate = {path: "customer_id", select: "-_id fullname"}
        const shippingPopulate = {path: "shipping_id", select: "-_id -__v"}

        const orderPopulate = {path: "order_id", select:"-_id -__v", populate:[ customerPopulate, shippingPopulate ]}

        return await OrderItem.find({seller_id: userId}).populate(productVariantPopulate).populate(orderPopulate)
    }

    // .populate({path:'item': populate:{path: 'productVariant'}})

    async updateOrderStatus(order_status: string, orderItemId: string){
        return await OrderItem.findByIdAndUpdate(orderItemId, {order_status: order_status}, {new: true})
    }
}