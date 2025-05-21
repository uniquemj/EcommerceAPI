
import { inject, injectable } from "tsyringe";
import { OrderRepository } from "../repository/order.repository";
import { CartInputItem, CartItem } from "../types/cart.types";
import { DeliverInfo, orderFilter, orderItemFilter } from "../types/order.types";
import { paginationField } from "../types/pagination.types";
import { OrderRepositoryInterface } from "../types/repository.types";
import createHttpError from "../utils/httperror.utils";
import { CartServices } from "./cart.services";
import { NotificationServices } from "./notification.services";
import { OrderItemServices } from "./orderItem.services";
import { ProductServices } from "./product.services";
import { VariantServices } from "./variant.services";
import { CustomerServices } from "./user/customer.services";

@injectable()
export class OrderServices {

    constructor(@inject('OrderRepositoryInterface') private readonly orderRepository: OrderRepositoryInterface,
        @inject(CartServices) private readonly cartServices: CartServices,
        @inject(OrderItemServices) private readonly orderItemServices: OrderItemServices,
        @inject(VariantServices) private readonly variantServices: VariantServices,
        @inject(ProductServices) private readonly productServices: ProductServices,
        @inject(NotificationServices) private readonly notificationServices: NotificationServices,
        @inject(CustomerServices) private readonly customerServices: CustomerServices
    ) { }

    getOrderList = async (pagination: paginationField, query: orderFilter) => {
        const orders = await this.orderRepository.getOrderList(pagination, query)
        if (orders.length == 0) {
            throw createHttpError.NotFound("Order List is Empty.")
        }
        const count = await this.orderRepository.getOrderCounts({})
        return { count, orders }
    }

    getCustomerOrderList = async (query: orderItemFilter, pagination: paginationField, userId: string) => {
        const orderExist = await this.orderRepository.getCustomerOrderList(userId, pagination)

        if (!orderExist) {
            throw createHttpError.NotFound("Order for User not found.")
        }
        const orders = await Promise.all(orderExist.map(async (order) => {
            const orderItems = await this.orderItemServices.getOrderItemList(order._id as string, query)

            const orderDetail = {
                order: order,
                orderItems: orderItems.orderItems
            }
            return orderDetail
        }))
        const count = await this.orderRepository.getOrderCounts({ customer_id: userId })
        return { count: count, orders }
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
        const customer = await this.customerServices.getCustomerById(userId)
        if(!customer) {
            throw createHttpError.BadRequest("No customer exist with email.")
        }
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
        if (order) {
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
            await this.notificationServices.sendOrderNotification(order._id as string, customer.fullname, customer.email, orderTotal, cartItems)

        }

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

        const itemStatus = orderItems.orderItems.some((item) => item.order_status == 'pending')

        if (!itemStatus) {
            throw createHttpError.BadRequest("Order can't be cancelled.")
        }

        orderItems.orderItems.forEach(async (item) => {
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

        const itemStatus = orderItems.orderItems.every((item) => item.order_status == 'delivered')

        if (!itemStatus) {
            throw createHttpError.BadRequest("Order can't be set to complete as order are still need to be delivered.")
        }

        const result = await this.orderRepository.updateOrder(order_id, { isCompleted: true })
        return result
    }
}