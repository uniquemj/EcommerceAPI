import { CartRepository } from "../../repository/cart/cart.repository";
import { OrderRepository } from "../../repository/order/order.repository";
import { OrderItemRepository } from "../../repository/orderitem/orderitem.repository";
import { ProductRepository } from "../../repository/product/product.repository";
import { ShipmentAddressRepository } from "../../repository/shipmentAddress/shipmentAddress.repository";
import { VariantRepository } from "../../repository/variant/variant.repository";
import { CartItem } from "../../types/cart.types";
import { DeliverInfo } from "../../types/order.types";
import { Helper } from "../../utils/helper.utils";
import createHttpError from "../../utils/httperror.utils";
import { CartServices } from "../cart/cart.services";

export class OrderServices{
    private readonly orderRepository: OrderRepository
    private readonly cartRepository: CartRepository
    private readonly cartServices: CartServices
    private readonly orderItemRepository: OrderItemRepository   
    private readonly shipmentAddressRepository: ShipmentAddressRepository
    private readonly productRepository: ProductRepository
    private readonly variantRepository:VariantRepository
    private readonly helper: Helper

    constructor(){
        this.orderRepository = new OrderRepository()
        this.cartRepository = new CartRepository()
        this.cartServices = new CartServices()
        this.orderItemRepository = new OrderItemRepository()
        this.shipmentAddressRepository = new ShipmentAddressRepository()
        this.productRepository = new ProductRepository()
        this.variantRepository = new VariantRepository()

        this.helper = new Helper()
    }

    getCustomerOrder = async(userId: string) =>{
        try{
            const orderExist = await this.orderRepository.getCustomerOrder(userId)

            if(!orderExist){
                throw createHttpError.NotFound("Order for User not found.")
            }

            const orderItems = await this.orderItemRepository.getOrderItemList(orderExist._id as string)

            const orderResponse = {
                order: orderExist,
                orderItems: orderItems
            }
            return orderResponse
        }catch(error){
            throw error
        }
    }

    createOrder = async(deliveryInfo: DeliverInfo, userId: string) =>{
        try{
            const {full_name, email, phone_number, region, city, address} = deliveryInfo

            const cartExist = await this.cartRepository.getCartByUserId(userId)

            if(!cartExist){
                throw createHttpError.BadRequest("Cart for User not found.")
            }
            const cartItems = cartExist.items as unknown as CartItem[]

            const shippingInfo = {
                customer_id: userId,
                full_name,
                email,
                phone_number,
                region,
                city,
                address
            }

            const shippingCreation = await this.shipmentAddressRepository.createShipmentAddress(shippingInfo)
            const orderTotal = await this.cartServices.getCartTotal(userId)

            const orderInfo = {
                shipping_id: shippingCreation._id as string,
                customer_id: userId,
                orderTotal: orderTotal
            }

            const order = await this.orderRepository.createOrder(orderInfo)

            cartItems.forEach(async(item)=>{
                const orderItem = {
                    productVariant: item.productVariant,
                    quantity: item.quantity
                }

                const orderItemInfo = {
                    order_id: order._id as string,
                    item: orderItem,
                }
                await this.orderItemRepository.createOrderItem(orderItemInfo)
            })

            await this.cartRepository.resetCart(userId)
            return order
        }catch(error){
            throw error
        }
    }

    updateOrderStatus = async(order_status: string, orderId: string, userId: string) =>{
        try{
            const orderExist = await this.orderItemRepository.getOrderItemById(orderId)

            if(!orderExist){
                throw createHttpError.NotFound("Order with Id not found.")
            }
            

            // const result = await this.orderItemRepository.updateOrderStatus(order_status, orderId)
            // return result
        }catch(error){
            throw error
        }
    } 
}