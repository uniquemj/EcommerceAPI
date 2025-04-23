import { Response, Router } from "express";
import { OrderServices } from "../../services/order/order.services";
import { AuthRequest } from "../../types/auth.types";
import createHttpError from "../../utils/httperror.utils";
import { allowedRole } from "../../middlewares/role.middleware";
import { DeliverInfo } from "../../types/order.types";
import { validate } from "../../middlewares/validation.middleware";
import { deliveryInfoSchema, orderStatusSchema } from "../../validation/order.validate";

export class OrderController{
    readonly router: Router;
    private static instance: OrderController;
    private readonly orderServices: OrderServices;

    private constructor(){
        this.router = Router()
        this.orderServices = new OrderServices()
    }

    static initController(){
        const instance = new OrderController()
        OrderController.instance = instance

        instance.router.get('/customer',allowedRole('customer'), instance.getCustomerOrder)
        instance.router.post('/', allowedRole('customer'), validate(deliveryInfoSchema), instance.createOrder)
        instance.router.put('/status/:id', allowedRole('seller'), validate(orderStatusSchema), instance.updateOrderStatus)
        instance.router.get('/seller', allowedRole('seller'), instance.getOrderForSeller)

        return instance
    }

    getCustomerOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const result = await this.orderServices.getCustomerOrder(userId)
            res.status(200).send({message: "Order Fetched.", response: result})
        }catch(e: any){
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
            const result = await this.orderServices.getOrderForSeller(sellerId)
            res.status(200).send({message: "Order Fetched for Seller.", response : result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateOrderStatus = async(req: AuthRequest, res: Response) =>{
        try{
            const {order_status} = req.body
            const orderItemId = req.params.id
            const userId = req.user?._id as string
            const result = await this.orderServices.updateOrderStatus(order_status, orderItemId, userId)
            res.status(200).send({message: "Order Status Updated", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}