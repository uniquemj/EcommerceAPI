
import { inject, injectable } from "tsyringe";
import { OrderRepository } from "../repository/order.repository";
import { CartInputItem, CartItem } from "../types/cart.types";
import { DeliverInfo, orderFilter, orderItemFilter, OrderSummaryDetail, PaymentMethod, PaymentStatus } from "../types/order.types";
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
        const count = await this.orderRepository.getOrderCounts({})
        return { count, orders }
    }

    getOrderListForAdmin = async(pagination: paginationField) => {
        const orders = await this.orderRepository.getAllOrderList(pagination)

        let orderDetail: OrderSummaryDetail[] = []

        for (let order of orders) {
            const orderItemList = await this.orderItemServices.getOrderItemList(String(order._id))

            const readyToShipItemCount = orderItemList.orderItems.filter((item) => item.order_status == 'shipping').length
            const deliveredItemCount = orderItemList.orderItems.filter((item)=>item.order_status == 'delivered').length
            const faildeliveryItemCount = orderItemList.orderItems.filter((item)=>item.order_status == 'faildelivery').length
            const processingItemCount = orderItemList.orderItems.filter((item)=>item.order_status != 'shipping' && item.order_status != 'delivered' && item.order_status != 'faildelivery').length

            orderDetail.push({
                orderInfo: order,
                orderCount: {
                    shipping: readyToShipItemCount,
                    delivered: deliveredItemCount,
                    faildelivery: faildeliveryItemCount,
                    processing: processingItemCount
                }
            })
        }
            return orderDetail
    }

    getCustomerOrderList = async (query: orderItemFilter & orderFilter, pagination: paginationField, userId: string) => {
        const orderExist = await this.orderRepository.getCustomerOrderList(userId, pagination, query)

        if (!orderExist) {
            throw createHttpError.NotFound("Order for User not found.")
        }
        const orders = await Promise.all(orderExist.map(async (order) => {
            const orderItems = await this.orderItemServices.getOrderItemList(order._id as string)

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

    createOrder = async (shipping_id: string, userId: string, payment_method: PaymentMethod, stripeData?: {paymentIntentId: string}) => {
        const customer = await this.customerServices.getCustomerById(userId)
        if (!customer) {
            throw createHttpError.BadRequest("No customer exist with email.")
        }
        const cartExist = await this.cartServices.getCartByUserId(userId)

        if (!cartExist) {
            throw createHttpError.BadRequest("Cart for User not found.")
        }
        const cartItems = cartExist.items as unknown as CartInputItem[]

        const orderTotal = await this.cartServices.getCartTotal(userId)

        let payment_status = PaymentStatus.UnPaid;
        let payment_intent_id: string | undefined;

        if(payment_method == PaymentMethod.CARD && stripeData){
            payment_status = PaymentStatus.Paid;
            payment_intent_id = stripeData.paymentIntentId
        }

        const orderInfo = {
            shipping_id:shipping_id,
            customer_id: userId,
            orderTotal: orderTotal.total,
            payment_method: payment_method,
            payment_status,
            payment_intent_id
        }


        const order = await this.orderRepository.createOrder(orderInfo)
        
        if (order) {
            cartItems.forEach(async (item) => {
                const variant = await this.variantServices.getVariant(item.productVariant)

                if (variant.stock > 0) {
                    const orderItem = {
                        productVariant: item.productVariant,
                        quantity: item.quantity
                    }
                    const product_id = await this.variantServices.getVariantProduct(item.productVariant)
                    await this.variantServices.updateStock(item.productVariant, -item.quantity)
                    const product = await this.productServices.getProductById(product_id as unknown as string)
                    await this.productServices.updateProductSellCount(String(product._id), item.quantity)
                    const orderItemInfo = {
                        order_id: order._id as unknown as string,
                        item: orderItem,
                        seller_id: product.seller
                    }
                    await this.orderItemServices.createOrderItem(orderItemInfo)
                    await this.notificationServices.sendOrderNotification(order._id as string, customer.fullname, customer.email, orderTotal.total, cartItems)
                    await this.cartServices.removeItemFromCart(item.productVariant, String(order.customer_id))
                }
            })
        }
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

    updateOrderItemAdminStatus = async(order_status: string, orderItemId: string) => {
        const orderItem = await this.orderItemServices.getOrderItemById(orderItemId)
        if(!orderItem){
            throw createHttpError.NotFound("Order Item with Id not found.")
        }
        const updateItemStatus = await this.orderItemServices.updateAdminOrderStatus(order_status, orderItemId)
    }

    updateOrderPaymentStatus = async(order_id: string) =>{
        const orderExist = await this.orderRepository.getOrderById(order_id)
        if (!orderExist) {
            throw createHttpError.NotFound("Order of Id not found.")
        }

        const result = await this.orderRepository.updateOrder(order_id, {payment_status: PaymentStatus.Paid})
        return result
    }
}