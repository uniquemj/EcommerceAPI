import { Response, Router } from "express";
import { OrderServices } from "../services/order.services";
import { AuthRequest } from "../types/auth.types";
import createHttpError from "../utils/httperror.utils";
import { allowedRole } from "../middlewares/role.middleware";
import { DeliverInfo, orderFilter, orderItemFilter } from "../types/order.types";
import { validate } from "../middlewares/validation.middleware";
import { adminOrderStatusSchema, deliveryInfoSchema, returnInitializeSchema, sellerOrderStatusSchema, updateReturnOrderStatusSchema } from "../validation/order.validate";
import { OrderItemServices } from "../services/orderItem.services";
import { handleSuccessResponse } from "../utils/httpresponse.utils";
import Logger from "../utils/logger.utils";
import winston from 'winston'

export class OrderController{
    readonly router: Router;
    private static instance: OrderController;

    private readonly logger: winston.Logger;

    private constructor(private readonly orderServices:OrderServices, private readonly orderItemServices: OrderItemServices, logger: Logger){
        this.router = Router();
        this.logger = logger.logger()
    }

    static initController(orderServices: OrderServices, orderItemServices: OrderItemServices, logger: Logger){

        if(!OrderController.instance){
            OrderController.instance = new OrderController(orderServices, orderItemServices, logger)
        }
        const instance = OrderController.instance

        instance.router.get('/detail/items/:id', allowedRole('seller', 'customer', 'admin'), instance.getOrderItemDetail)
        // Customer
        instance.router.get('/customer',allowedRole('customer'), instance.getCustomerOrderList)
        instance.router.get('/customer/:id', allowedRole('customer'), instance.getCustomerOrderDetail)
        instance.router.put('/cancel/:id', allowedRole('customer'), instance.cancelOrder)
        instance.router.post('/', allowedRole('customer'), validate(deliveryInfoSchema), instance.createOrder)
        instance.router.put('/return/init/:id', allowedRole('customer'), validate(returnInitializeSchema), instance.updateOrderReturnInitialize)
        
        // Seller
        instance.router.get('/seller', allowedRole('seller'), instance.getOrderForSeller)
        instance.router.put('/seller/status/:id', allowedRole('seller'), validate(sellerOrderStatusSchema), instance.updateSellerOrderStatus)
        instance.router.get('/items/count', allowedRole('seller'), instance.getSellerOrderItemCountByDate)
        instance.router.put('/return/update/:id', allowedRole('seller'), validate(updateReturnOrderStatusSchema),instance.updateSellerOrderReturnStatus)
        
        // Admin
        instance.router.get('/summary', allowedRole('admin'), instance.getOrderSummaryForAdmin)
        instance.router.get('/', allowedRole('admin'), instance.getOrderList)
        instance.router.get('/admin/items', allowedRole('admin'), instance.getOrderItemForAdmin)
        instance.router.get('/items', allowedRole('admin'), instance.getOrderItemList)
        instance.router.get('/:orderId', allowedRole('admin'), instance.getOrderItemsForOrder)
        instance.router.put('/complete/:id', allowedRole('admin'), instance.completeOrder)
        instance.router.put('/admin/status/:id', allowedRole('admin'), validate(adminOrderStatusSchema), instance.updateAdminOrderStatus)
        instance.router.put('/update/payment', allowedRole('admin'), instance.updateOrderPaymentStatus)
        return instance
    }

    getCustomerOrderList = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const query = req.query
            const page = req.query.page || 1
            const limit = req.query.limit || 10

            delete req.query.page
            delete req.query.limit

            const result = await this.orderServices.getCustomerOrderList(query, {page: parseInt(page as string), limit: parseInt(limit as string)}, userId)

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.count,
                total_pages: Math.ceil(result.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Order Fetched.", result.orders, 200, paginationData)
        }catch(e: any){
            this.logger.error("Error while getting Order list for Customer.", {object: e, error: new Error()})
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
            this.logger.error("Error while fetching Order Detail For Customer.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const orderInfo = req.body
            const userId = req.user?._id as string

            const result = await this.orderServices.createOrder(orderInfo.shipping_id, userId, orderInfo.payment_method, orderInfo.stripeData)
            handleSuccessResponse(res, "Order Created.", result)
        }catch(e: any){
            this.logger.error("Error while creating Order.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderForSeller = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.user?._id as string
            const query= req.query.order_status as string
            const page = req.query.page || 1
            const limit = req.query.limit || 10

            delete req.query.page
            delete req.query.limit
            
            const result = await this.orderItemServices.getOrderForSeller(sellerId,{page: parseInt(page as string), limit: parseInt(limit as string)}, query)
  
            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.count,
                total_pages: Math.ceil(result.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Received Order Item Fetched for Seller.", result.orderItems, 200, paginationData)
        }catch(e: any){
            this.logger.error("Error while fetching received order items for seller.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderItemForAdmin = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10


            const result = await this.orderItemServices.getOrderItemsForAdmin({page: parseInt(page as string), limit: parseInt(limit as string)})


            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.length,
                total_pages: Math.ceil((result.length) / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Fetched Order Items for Admin", result, 200, paginationData)

        }catch(e:any){
            this.logger.error("Error while fetching order items for admin.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderItemDetail = async(req: AuthRequest, res: Response) =>{
        try{
            const orderItemId = req.params.id
            const result = await this.orderItemServices.getOrderItemById(orderItemId)
            handleSuccessResponse(res, "Order Item Detail Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching order item detail for seller.", {object: e, error: new Error()})
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
            this.logger.error("Error while updating order item status by seller.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateAdminOrderStatus = async(req: AuthRequest, res: Response) =>{
        try{
            const {order_status} = req.body
            const orderItemId = req.params.id
            const result = await this.orderItemServices.updateAdminOrderStatus(order_status, orderItemId)
            handleSuccessResponse(res, "Order Item Status Updated.", result)
        }catch(e:any){
            this.logger.error("Error while updating order item status by admin.", {object: e, error: new Error()})
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
            this.logger.error("Error while marking order as canceled.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    completeOrder = async(req: AuthRequest, res: Response) =>{
        try{
            const order_id = req.params.id
            const result = await this.orderServices.completeOrder(order_id)
            handleSuccessResponse(res, "Order is Completed.", result)
        }catch(e:any){
            this.logger.error("Error while marking order as completed.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderList = async(req: AuthRequest, res: Response) =>{
        try{
            const query = req.query
            const page = req.query.page || 1
            const limit = req.query.limit || 10

            delete req.query.page
            delete req.query.limit

            const result = await this.orderServices.getOrderList({page: parseInt(page as string), limit: parseInt(limit as string)},query)

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.count,
                total_pages: Math.ceil(result.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Order List Fetched.", result.orders, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while fetching order list.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderItemList = async(req: AuthRequest, res: Response) =>{
        try{

            const query = req.query.order_status as string
            const page = req.query.page || 1
            const limit = req.query.limit || 10

            delete req.query.page
            delete req.query.limit

            const result = await this.orderItemServices.getAllOrderItem({page: parseInt(page as string), limit: parseInt(limit as string)},query)

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.count,
                total_pages: Math.ceil(result.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Order Item List Fetched.", result, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while fetching Order Item List.", {object: e, error: new Error()})
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
            this.logger.error("Error while fetching Order Items for Order.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateOrderReturnInitialize= async(req: AuthRequest, res: Response) =>{
        try{
            const orderItemId = req.params.id
            const return_reason = req.body.return_reason
            const result = await this.orderItemServices.updateOrderReturnInitialize(orderItemId, return_reason)
            handleSuccessResponse(res, "Order Item Initiated for Return.", result)
        }catch(e:any){
            this.logger.error("Error while initializing order item return request.", {object: e, error: new Error()})
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
            this.logger.error("Error while updating order item return status.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateOrderPaymentStatus = async(req: AuthRequest, res: Response) =>{
        try{
            const {order_id} = req.body
            const result = await this.orderServices.updateOrderPaymentStatus(order_id)
            handleSuccessResponse(res, "Return Order Payment Status.", result)
        }catch(e:any){
            this.logger.error("Error while updating payment status.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerOrderItemCountByDate = async(req: AuthRequest, res: Response) => {
        try{
            const sellerId = req.user?._id as string
            const result = await this.orderItemServices.getSellerOrderCountByDate(sellerId)
            handleSuccessResponse(res, "Order Item Count of Seller by date fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching OrderItem count By date.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getOrderSummaryForAdmin = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10

            const result = await this.orderServices.getOrderListForAdmin({page: parseInt(page as string), limit: parseInt(limit as string)})

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.length,
                total_pages: Math.ceil(result.length / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Order List Summary for Admin Received.", result, 200, paginationData)

        }catch(e:any){
            this.logger.error("Error while fetching Order Summary for Admin", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}