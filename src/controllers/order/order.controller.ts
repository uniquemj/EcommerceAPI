import { Response, Router } from "express";
import { OrderServices } from "../../services/order/order.services";
import { AuthRequest } from "../../types/auth.types";
import createHttpError from "../../utils/httperror.utils";
import { allowedRole } from "../../middlewares/role.middleware";
import { DeliverInfo, orderItemFilter } from "../../types/order.types";
import { validate } from "../../middlewares/validation.middleware";
import { deliveryInfoSchema, sellerOrderStatusSchema } from "../../validation/order.validate";
import { OrderItemServices } from "../../services/orderItem/orderItem.services";

export class OrderController{
    readonly router: Router;
    private static instance: OrderController;

    private constructor(private readonly orderServices:OrderServices, private readonly orderItemServices: OrderItemServices){
        this.router = Router()
    }

    static initController(orderServices: OrderServices, orderItemServices: OrderItemServices){
        const instance = new OrderController(orderServices, orderItemServices)
        OrderController.instance = instance

        // Customer can filter out based on "pending", "canceled" and "delivered" order status for order item list with each order
        instance.router.get('/customer',allowedRole('customer'), instance.getCustomerOrderList)
        instance.router.get('/customer/:id', allowedRole('customer'), instance.getCustomerOrderDetail)

        instance.router.post('/', allowedRole('customer'), validate(deliveryInfoSchema), instance.createOrder)
        instance.router.put('/status/:id', allowedRole('seller'), validate(sellerOrderStatusSchema), instance.updateOrderStatus)

        // Seller can filter out based on "pending", "canceled" and "delivered" order status for order item list.
        instance.router.get('/seller', allowedRole('seller'), instance.getOrderForSeller)
        instance.router.get('/seller/:id', allowedRole('seller'), instance.getSellerOrderDetail)
        instance.router.put('/cancel/:id', allowedRole('customer'), instance.cancelOrder)
        instance.router.put('/complete/:id', allowedRole('seller'), instance.completeOrder)
        return instance
    }

    getCustomerOrderList = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const status = req.query as orderItemFilter
            const result = await this.orderServices.getCustomerOrderList(status, userId)
            res.status(200).send({message: "Order Fetched.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getCustomerOrderDetail = async(req: AuthRequest, res: Response) =>{
        try{
            const orderId = req.params.id
            const userId = req.user?._id as string

            const result = await this.orderServices.getCustomerOrder(orderId, userId)
            res.status(200).send({message: "Order detail fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const deliveryInfo = req.body as DeliverInfo
            const userId = req.user?._id as string

            const result = await this.orderServices.createOrder(deliveryInfo, userId)
            res.status(200).send({message: "Order Created", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderForSeller = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.user?._id as string
            const query= req.query as orderItemFilter
            const result = await this.orderItemServices.getOrderForSeller(sellerId, query)
            res.status(200).send({message: "Order Fetched for Seller.", response : result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerOrderDetail = async(req: AuthRequest, res: Response) =>{
        try{
            const orderItemId = req.params.id
            const result = await this.orderItemServices.getOrderItemById(orderItemId)
            res.status(200).send({message: "Order Item Detail fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    updateOrderStatus = async(req: AuthRequest, res: Response) =>{
        try{
            const {order_status} = req.body
            const orderItemId = req.params.id
            const result = await this.orderItemServices.updateOrderStatus(order_status, orderItemId)
            res.status(200).send({message: "Order Status Updated", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    cancelOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const order_id = req.params.id
            const userId = req.user?._id as string

            const result = await this.orderServices.cancelOrder(order_id, userId)
            res.status(200).send({message: "Order Cancelled.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    completeOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const order_id = req.params.id
            const result = await this.orderServices.completeOrder(order_id)
            res.status(200).send({message: "Order is completed.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}