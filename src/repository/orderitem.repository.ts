import { injectable } from "tsyringe";
import OrderItem from "../model/orderitem.model";
import { orderItemFilter } from "../types/order.types";
import { OrderItemCountFilter, OrderItemInfo, OrderItemInputInfo } from "../types/orderitem.types";
import { paginationField } from "../types/pagination.types";
import { OrderItemRepositoryInterface } from "../types/repository.types";

@injectable()
export class OrderItemRepository implements OrderItemRepositoryInterface{
    private productVariantPopulate = {path: "item", populate: {path: "productVariant", select: '-__v', populate: {path: "product", select: "_id name"}}}

    async createOrderItem(orderItemInfo: Partial<OrderItemInputInfo>): Promise<OrderItemInfo>{
        return await OrderItem.create(orderItemInfo)
    }

    async getOrderItemById(orderItemId: string): Promise<OrderItemInfo | null>{
        const customerPopulate = {path: "customer_id", select: "-_id fullname"}
        const shippingPopulate = {path: "shipping_id", select: "-_id -customer_id -__v"}
        const orderPopulate = {path: "order_id", select:" -__v -orderTotal", populate:[ customerPopulate, shippingPopulate ]}
        return await OrderItem.findById(orderItemId)
        .populate(this.productVariantPopulate)
        .populate(orderPopulate)
    }

    async getOrderItemList(orderId: string, query: orderItemFilter): Promise<OrderItemInfo[]>{
        return await OrderItem.find({order_id: orderId, ...query})
        .populate(this.productVariantPopulate)
        .select('-__v')
    }

    async getAllOrderItems(pagination: paginationField, query: orderItemFilter): Promise<OrderItemInfo[] | []>{
        return await OrderItem.find({...query})
        .populate(this.productVariantPopulate)
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .select('-__v')
    }

    async getOrderForSeller(userId: string, pagination: paginationField, query: orderItemFilter): Promise<OrderItemInfo[]>{
        const customerPopulate = {path: "customer_id", select: "-_id fullname"}
        const shippingPopulate = {path: "shipping_id", select: "-_id -customer_id -__v"}
        const orderPopulate = {path: "order_id", select:" -__v -orderTotal", populate:[ customerPopulate, shippingPopulate ]}

        return await OrderItem.find({seller_id: userId, ...query})
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .populate(this.productVariantPopulate)
        .populate(orderPopulate)
        .select('-seller_id')
    }

    async getOrderItemCount (countFilter: OrderItemCountFilter): Promise<number>{
        return await OrderItem.countDocuments({...countFilter})
    }

    async updateOrderItem(updateOrderItemInfo: Partial<OrderItemInfo>, orderItemId: string): Promise<OrderItemInfo|null>{
        return await OrderItem.findByIdAndUpdate(orderItemId, updateOrderItemInfo, {new: true})
    }
}