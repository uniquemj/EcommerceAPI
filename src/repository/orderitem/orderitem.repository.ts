import OrderItem from "../../model/orderitem/orderitem.model";
import { orderItemFilter } from "../../types/order.types";
import { OrderItemInfo } from "../../types/orderitem.types";

export class OrderItemRepository{
    private productVariantPopulate = {path: "item", populate: {path: "productVariant", select: '-__v', populate: {path: "product", select: "_id name"}}}

    async createOrderItem(orderItemInfo: OrderItemInfo){
        return await OrderItem.create(orderItemInfo)
    }

    async getOrderItemById(orderId: string){
        return await OrderItem.findById(orderId).populate(this.productVariantPopulate)
    }

    async getOrderItemList(orderId: string, status: orderItemFilter){
        console.log(status)
        return await OrderItem.find({order_id: orderId, ...status}).populate(this.productVariantPopulate).select('-__v')
    }

    async getOrderForSeller(userId: string, status: orderItemFilter){
        const customerPopulate = {path: "customer_id", select: "-_id fullname"}
        const shippingPopulate = {path: "shipping_id", select: "-_id -customer_id -__v"}
        const orderPopulate = {path: "order_id", select:" -__v -orderTotal", populate:[ customerPopulate, shippingPopulate ]}
        
        return await OrderItem.find({seller_id: userId, ...status}).populate(this.productVariantPopulate).populate(orderPopulate).select('-seller_id')
    }


    async updateOrderItem(updateOrderItemInfo: OrderItemInfo, orderItemId: string){
        return await OrderItem.findByIdAndUpdate(orderItemId, updateOrderItemInfo, {new: true})
    }
}