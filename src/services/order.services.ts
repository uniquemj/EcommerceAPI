
import { OrderRepository } from "../repository/order.repository";
import { CartInputItem, CartItem } from "../types/cart.types";
import { DeliverInfo, orderFilter, orderItemFilter } from "../types/order.types";
import createHttpError from "../utils/httperror.utils";
import { CartServices } from "./cart.services";
import { NotificationServices } from "./notification.services";
import { OrderItemServices } from "./orderItem.services";
import { ProductServices } from "./product.services";
import { VariantServices } from "./variant.services";

export class OrderServices {

    constructor(private readonly orderRepository: OrderRepository,
        private readonly cartServices: CartServices,
        private readonly orderItemServices: OrderItemServices,
        private readonly variantServices: VariantServices,
        private readonly productServices: ProductServices,
        private readonly notificationServices: NotificationServices
    ) { }

    getOrderList = async (query: orderFilter) => {
        const orders = await this.orderRepository.getOrderList(query)
        if (orders.length == 0) {
            throw createHttpError.NotFound("Order List is Empty.")
        }
        return orders
    }

    getCustomerOrderList = async (query: orderItemFilter, userId: string) => {
        const orderExist = await this.orderRepository.getCustomerOrderList(userId)

        if (!orderExist) {
            throw createHttpError.NotFound("Order for User not found.")
        }
        const orders = await Promise.all(orderExist.map(async (order) => {
            const orderItems = await this.orderItemServices.getOrderItemList(order._id as string , query)

            const orderDetail = {
                order: order,
                orderItems: orderItems
            }
            return orderDetail
        }))

        return orders
    }

    getCustomerOrder = async (orderId: string, userId: string) => {
        const orderExist = await this.orderRepository.getCustomerOrder(orderId, userId)

        if (!orderExist) {
            throw createHttpError.NotFound("Order for User not found.")
        }

        const orderItems = await this.orderItemServices.getOrderItemList(orderId, {})

        const orderResponse = {
            order: orderExist,
            orderItems: orderItems
        }
        return orderResponse
    }

    createOrder = async (deliveryInfo: DeliverInfo, userId: string) => {

        const cartExist = await this.cartServices.getCartByUserId(userId)

        if (!cartExist) {
            throw createHttpError.BadRequest("Cart for User not found.")
        }
        const cartItems = cartExist.items as unknown as CartInputItem[]

        const orderTotal = await this.cartServices.getCartTotal(userId)

        const orderInfo = {
            shipping_id: deliveryInfo.shipping_id as string,
            customer_id: userId,
            orderTotal: orderTotal
        }


        const order = await this.orderRepository.createOrder(orderInfo)

        await this.notificationServices.sendOrderNotification(order._id as string, userId, orderTotal, cartItems)

        cartItems.forEach(async (item) => {
            const orderItem = {
                productVariant: item.productVariant,
                quantity: item.quantity
            }
            const product_id = await this.variantServices.getVariantProduct(item.productVariant)
            await this.variantServices.updateStock(item.productVariant, -item.quantity)
            const product = await this.productServices.getProductById(product_id as unknown as string)
            
            const orderItemInfo = {
                order_id: order._id as unknown as string,
                item: orderItem,
                seller_id: product.seller
            }
            await this.orderItemServices.createOrderItem(orderItemInfo)
        })

        await this.cartServices.resetCart(userId)
        return order
    }



    cancelOrder = async (order_id: string, userId: string) => {
        const orderExist = await this.orderRepository.getOrderById(order_id)

        if (!orderExist) {
            throw createHttpError.NotFound("Order with Id not found.")
        }
        if (orderExist.customer_id as unknown as string != userId) {
            throw createHttpError.NotFound("Order not found.")
        }

        const orderItems = await this.orderItemServices.getOrderItemList(order_id, {})

        const itemStatus = orderItems.some((item) => item.order_status == 'pending')

        if (!itemStatus) {
            throw createHttpError.BadRequest("Order can't be cancelled.")
        }

        orderItems.forEach(async (item) => {
            await this.orderItemServices.updateSellerOrderStatus("canceled", item._id)
            await this.variantServices.updateStock(item.item.productVariant as unknown as string, item.item.quantity)
        })

        const result = await this.orderRepository.updateOrder(order_id, { isCanceled: true, cancelAt: Date.now() as unknown as Date })
        return result
    }

    completeOrder = async (order_id: string) => {
        const orderExist = await this.orderRepository.getOrderById(order_id)
        if (!orderExist) {
            throw createHttpError.NotFound("Order of Id not found.")
        }
        const orderItems = await this.orderItemServices.getOrderItemList(order_id, {})

        const itemStatus = orderItems.every((item) => item.order_status == 'delivered')

        if (!itemStatus) {
            throw createHttpError.BadRequest("Order can't be set to complete as order are still need to be delivered.")
        }

        const result = await this.orderRepository.updateOrder(order_id, { isCompleted: true })
        return result
    }
}