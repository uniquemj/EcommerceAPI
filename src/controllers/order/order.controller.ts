import { Response, Router } from "express";
import { OrderServices } from "../../services/order/order.services";
import { AuthRequest } from "../../types/auth.types";
import createHttpError from "../../utils/httperror.utils";
import { allowedRole } from "../../middlewares/role.middleware";
import { DeliverInfo } from "../../types/order.types";
import { validate } from "../../middlewares/validation.middleware";
import { deliveryInfoSchema } from "../../validation/order.validate";

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

        instance.router.get('/',allowedRole('customer'), instance.getOrder)
        instance.router.post('/', allowedRole('customer'), validate(deliveryInfoSchema), instance.createOrder)
        return instance
    }

    getOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const result = await this.orderServices.getOrder(userId)
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
}