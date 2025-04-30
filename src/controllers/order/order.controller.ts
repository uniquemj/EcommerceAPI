import { Response, Router } from "express";
import { OrderServices } from "../../services/order/order.services";
import { AuthRequest } from "../../types/auth.types";
import createHttpError from "../../utils/httperror.utils";
import { allowedRole } from "../../middlewares/role.middleware";
import { DeliverInfo, orderFilter, orderItemFilter } from "../../types/order.types";
import { validate } from "../../middlewares/validation.middleware";
import { adminOrderStatusSchema, deliveryInfoSchema, sellerOrderStatusSchema, updateReturnOrderStatusSchema } from "../../validation/order.validate";
import { OrderItemServices } from "../../services/orderItem/orderItem.services";
import { handleSuccessResponse } from "../../utils/httpresponse.utils";

export class OrderController{
    readonly router: Router;
    private static instance: OrderController;

    private constructor(private readonly orderServices:OrderServices, private readonly orderItemServices: OrderItemServices){
        this.router = Router()
    }

    static initController(orderServices: OrderServices, orderItemServices: OrderItemServices){

        if(!OrderController.instance){
            OrderController.instance = new OrderController(orderServices, orderItemServices)
        }
        const instance = OrderController.instance

        // Customer
        instance.router.get('/customer',allowedRole('customer'), instance.getCustomerOrderList)
        instance.router.get('/customer/:id', allowedRole('customer'), instance.getCustomerOrderDetail)
        instance.router.put('/cancel/:id', allowedRole('customer'), instance.cancelOrder)
        instance.router.post('/', allowedRole('customer'), validate(deliveryInfoSchema), instance.createOrder)
        instance.router.put('/return/init/:id', allowedRole('customer'), instance.updateOrderReturnInitialize)
        
        // Seller
        instance.router.get('/seller', allowedRole('seller'), instance.getOrderForSeller)
        instance.router.put('/seller/status/:id', allowedRole('seller'), validate(sellerOrderStatusSchema), instance.updateSellerOrderStatus)
        instance.router.get('/seller/:id', allowedRole('seller'), instance.getSellerOrderDetail)
        instance.router.put('/return/update/:id', allowedRole('seller'), validate(updateReturnOrderStatusSchema),instance.updateSellerOrderReturnStatus)
        
        // Admin
        instance.router.get('/', allowedRole('admin'), instance.getOrderList)
        instance.router.get('/items', allowedRole('admin'), instance.getOrderItemList)
        instance.router.get('/:orderId', allowedRole('admin'), instance.getOrderItemsForOrder)
        instance.router.put('/complete/:id', allowedRole('admin'), instance.completeOrder)
        instance.router.put('/admin/status/:id', allowedRole('admin'), validate(adminOrderStatusSchema), instance.updateAdminOrderStatus)

        return instance
    }

    getCustomerOrderList = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const query = req.query as orderItemFilter

            const result = await this.orderServices.getCustomerOrderList(query, userId)
            handleSuccessResponse(res, "Order Fetched.", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getCustomerOrderDetail = async(req: AuthRequest, res: Response) =>{
        try{
            const orderId = req.params.id
            const userId = req.user?._id as string

            const result = await this.orderServices.getCustomerOrder(orderId, userId)
            handleSuccessResponse(res, "Order detail fetched.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const deliveryInfo = req.body as DeliverInfo
            const userId = req.user?._id as string

            const result = await this.orderServices.createOrder(deliveryInfo, userId)
            handleSuccessResponse(res, "Order Created.", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderForSeller = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.user?._id as string
            const query= req.query as orderItemFilter
            const result = await this.orderItemServices.getOrderForSeller(sellerId, query)
            handleSuccessResponse(res, "Order Fetched for Seller.", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerOrderDetail = async(req: AuthRequest, res: Response) =>{
        try{
            const orderItemId = req.params.id
            const result = await this.orderItemServices.getOrderItemById(orderItemId)
            handleSuccessResponse(res, "Order Item Detail Fetched.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateSellerOrderStatus = async(req: AuthRequest, res: Response) =>{
        try{
            const {order_status} = req.body
            const orderItemId = req.params.id
            const result = await this.orderItemServices.updateSellerOrderStatus(order_status, orderItemId)
            handleSuccessResponse(res, "Order Status Updated.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateAdminOrderStatus = async(req: AuthRequest, res: Response) =>{
        try{
            const {order_status} = req.body
            const orderItemId = req.params.id
            const result = await this.orderItemServices.updateAdminOrderStatus(order_status, orderItemId)
            handleSuccessResponse(res, "Order Status Updated.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    cancelOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const order_id = req.params.id
            const userId = req.user?._id as string

            const result = await this.orderServices.cancelOrder(order_id, userId)
            handleSuccessResponse(res, "Order Canceled.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    completeOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const order_id = req.params.id
            const result = await this.orderServices.completeOrder(order_id)
            handleSuccessResponse(res, "Order is Completed.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderList = async(req: AuthRequest, res: Response) =>{
        try{
            const query = req.query as orderFilter
            const result = await this.orderServices.getOrderList(query)
            handleSuccessResponse(res, "Order List Fetched.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderItemList = async(req: AuthRequest, res: Response) =>{
        try{
            const query = req.query as orderItemFilter
            const result = await this.orderItemServices.getAllOrderItem(query)
            handleSuccessResponse(res, "Order Item List Fetched.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderItemsForOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const orderId = req.params.orderId
            const query = req.query as orderItemFilter
            const result = await this.orderItemServices.getOrderItemList(orderId, query)
            handleSuccessResponse(res, "Order items Fetched for Order.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateOrderReturnInitialize= async(req: AuthRequest, res: Response) =>{
        try{
            const orderItemId = req.params.id
            const result = await this.orderItemServices.updateOrderReturnInitialize(orderItemId)
            handleSuccessResponse(res, "Order Item Initiated for Return.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateSellerOrderReturnStatus = async(req: AuthRequest, res: Response) =>{
        try{
            const orderItemId = req.params.id
            const {order_status} = req.body
            const result = await this.orderItemServices.updateSellerReturnOrderStatus(order_status, orderItemId)
            handleSuccessResponse(res, "Return Order Item Status Updated.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}