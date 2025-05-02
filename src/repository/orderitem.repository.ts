import OrderItem from "../model/orderitem.model";
import { orderItemFilter } from "../types/order.types";
import { OrderItemInfo } from "../types/orderitem.types";

export class OrderItemRepository{
    private productVariantPopulate = {path: "item", populate: {path: "productVariant", select: '-__v', populate: {path: "product", select: "_id name"}}}

    async createOrderItem(orderItemInfo: OrderItemInfo){
        return await OrderItem.create(orderItemInfo)
    }

    async getOrderItemById(orderItemId: string){
        const customerPopulate = {path: "customer_id", select: "-_id fullname"}
        const shippingPopulate = {path: "shipping_id", select: "-_id -customer_id -__v"}
        const orderPopulate = {path: "order_id", select:" -__v -orderTotal", populate:[ customerPopulate, shippingPopulate ]}
        return await OrderItem.findById(orderItemId).populate(this.productVariantPopulate).populate(orderPopulate)
    }

    async getOrderItemList(orderId: string, query: orderItemFilter){
        return await OrderItem.find({order_id: orderId, ...query}).populate(this.productVariantPopulate).select('-__v')
    }

    async getAllOrderItems(query: orderItemFilter){
        return await OrderItem.find({...query}).populate(this.productVariantPopulate).select('-__v')
    }

    async getOrderForSeller(userId: string, query: orderItemFilter){
        const customerPopulate = {path: "customer_id", select: "-_id fullname"}
        const shippingPopulate = {path: "shipping_id", select: "-_id -customer_id -__v"}
        const orderPopulate = {path: "order_id", select:" -__v -orderTotal", populate:[ customerPopulate, shippingPopulate ]}

        return await OrderItem.find({seller_id: userId, ...query}).populate(this.productVariantPopulate).populate(orderPopulate).select('-seller_id')
    }


    async updateOrderItem(updateOrderItemInfo: OrderItemInfo, orderItemId: string){
        return await OrderItem.findByIdAndUpdate(orderItemId, updateOrderItemInfo, {new: true})
    }
}