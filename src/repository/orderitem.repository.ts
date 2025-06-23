import { injectable } from "tsyringe";
import OrderItem from "../model/orderitem.model";
import { OrderItemDateCount, orderItemFilter, OrderStatus } from "../types/order.types";
import { OrderItemCountFilter, OrderItemInfo, OrderItemInputInfo } from "../types/orderitem.types";
import { paginationField } from "../types/pagination.types";
import { OrderItemRepositoryInterface } from "../types/repository.types";
import { Types } from "mongoose";
import { format } from "path";

@injectable()
export class OrderItemRepository implements OrderItemRepositoryInterface {
    private productVariantPopulate = { path: "item", populate: { path: "productVariant", select: '-__v', populate: [{ path: 'images', select: '_id url' }, { path: "product", select: "_id name" }] } }

    async createOrderItem(orderItemInfo: Partial<OrderItemInputInfo>): Promise<OrderItemInfo> {
        return await OrderItem.create(orderItemInfo)
    }

    async getOrderItemById(orderItemId: string): Promise<OrderItemInfo | null> {
        const customerPopulate = { path: "customer_id", select: "-_id fullname" }
        const shippingPopulate = { path: "shipping_id", select: "-_id -customer_id -__v" }
        const orderPopulate = { path: "order_id", select: " -__v -orderTotal", populate: [customerPopulate, shippingPopulate] }
        return await OrderItem.findById(orderItemId)
            .populate(this.productVariantPopulate)
            .populate(orderPopulate)
            .populate({ path: 'seller_id', select: 'email store_name fullname address city country phone_number' })
            .sort('-createdAt')
    }

    async getOrderItemList(orderId: string, query?: orderItemFilter): Promise<OrderItemInfo[]> {
        return await OrderItem.find({ order_id: orderId, ...query })
            .populate(this.productVariantPopulate)
            .select('-__v')
            .sort('-createdAt')
    }

    async getAllOrderItems(pagination: paginationField, query?: string): Promise<OrderItemInfo[] | []> {
        const customerPopulate = { path: "customer_id", select: "-_id fullname" }
        const shippingPopulate = { path: "shipping_id", select: "-_id -customer_id -__v" }
        const orderPopulate = { path: "order_id", select: " -__v -orderTotal", populate: [customerPopulate, shippingPopulate] }
        return await OrderItem.find({ order_status: query })
            .populate(this.productVariantPopulate)
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .populate(orderPopulate)
            .populate({ path: 'seller_id', select: 'email store_name fullname address city country phone_number' })
            .select('-__v')
            .sort('-createdAt')
    }


    async getOrderItemsForAdmin(pagination: paginationField): Promise<OrderItemInfo[]> {
        const customerPopulate = { path: "customer_id", select: "-_id fullname" }
        const shippingPopulate = { path: "shipping_id", select: "-_id -customer_id -__v" }
        const orderPopulate = { path: "order_id", select: " -__v -orderTotal", populate: [customerPopulate, shippingPopulate] }

        return await OrderItem.find({
            $or: [
                { order_status: 'shipping' },
                { order_status: 'delivered' },
                { order_status: 'faildelivery' }
            ]
        }).populate(this.productVariantPopulate)
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .populate(orderPopulate)
            .populate({ path: 'seller_id', select: 'store_name' })
            .select('-__v')
            .sort('-createdAt')
    }
    async getOrderForSeller(userId: string, pagination: paginationField, query?: orderItemFilter): Promise<OrderItemInfo[]> {
        let searchFilter = query?.['order_status'] ? query : null

        const customerPopulate = { path: "customer_id", select: "-_id fullname" }
        const shippingPopulate = { path: "shipping_id", select: "-_id -customer_id -__v" }
        const orderPopulate = { path: "order_id", select: " -__v -orderTotal", populate: [customerPopulate, shippingPopulate] }


        return await OrderItem.find({ seller_id: userId, ...searchFilter })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .populate(this.productVariantPopulate)
            .populate(orderPopulate)
            .select('-seller_id')
            .sort('-createdAt')
    }
    
    async getOrderForSellerCount(userId: string, query?: orderItemFilter): Promise<number> {
        let searchFilter = query?.['order_status'] ? query : null

        const customerPopulate = { path: "customer_id", select: "-_id fullname" }
        const shippingPopulate = { path: "shipping_id", select: "-_id -customer_id -__v" }
        const orderPopulate = { path: "order_id", select: " -__v -orderTotal", populate: [customerPopulate, shippingPopulate] }


        return await OrderItem.find({ seller_id: userId, ...searchFilter }).countDocuments()
    }

    async getOrderItemCount(countFilter: OrderItemCountFilter): Promise<number> {
        return await OrderItem.countDocuments({ ...countFilter })
    }

    async updateOrderItem(updateOrderItemInfo: Partial<OrderItemInfo>, orderItemId: string): Promise<OrderItemInfo | null> {
        return await OrderItem.findByIdAndUpdate(orderItemId, updateOrderItemInfo, { new: true })
    }

    async getOrderItemCountByDate(sellerId: string): Promise<OrderItemDateCount[]> {
        const result = await OrderItem.aggregate([
            {
                $match: {
                    'seller_id': new Types.ObjectId(sellerId),
                    'order_status': OrderStatus.Delivered
                }
            },
            { $unwind: '$item' },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'item.productVariant',
                    foreignField: '_id',
                    as: 'variant'
                }
            },
            {
                $unwind: '$variant'
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                },
            },
            { $unwind: '$order' },
            {
                $addFields: {
                    orderDate: {
                        $dateToString: { format: '%Y-%m-%d', date: "$order.order_timeStamp" }
                    },
                    itemTotal: {
                        $multiply: ["$item.quantity", "$variant.price"]
                    }
                },
            },
            {
                $group: {
                    _id: '$orderDate',
                    totalQuantity: { $sum: '$item.quantity' },
                    totalSale: { $sum: '$itemTotal' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ])
        return result
    }
}