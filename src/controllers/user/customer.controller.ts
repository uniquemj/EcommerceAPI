import { Request, Response, Router } from "express";
import { CustomerServices } from "../../services/user/customer.services";
import { validate } from "../../middlewares/validation.middleware";
import { customerRegisterSchema, loginSchema, resendVerificationEmailSchema, updatePasswordSchema } from "../../validation/user.validate";
import createHttpError from "../../utils/httperror.utils";
import { COOKIE } from "../../constant/cookie";
import { AuthRequest } from "../../types/auth.types";
import { verifyToken } from "../../middlewares/auth.middleware";
import { updateCustomerProfileSchema } from "../../validation/user.validate";
import { allowedRole } from "../../middlewares/role.middleware";
import { verifySuperAdmin } from "../../middlewares/admin.middleware";
import { handleSuccessResponse } from "../../utils/httpresponse.utils";
import Logger from "../../utils/logger.utils";
import wiston from 'winston'

export class CustomerController{
    
    readonly router: Router;
    private static instance: CustomerController;
    private readonly logger: wiston.Logger

    private constructor(private readonly customerService: CustomerServices, logger: Logger){
        this.router = Router()
        this.logger = logger.logger()
    }

    static initController(customerService: CustomerServices, logger: Logger){
        if(!CustomerController.instance){
            CustomerController.instance = new CustomerController(customerService, logger)
        }
        
        const instance = CustomerController.instance

        instance.router.post('/verify/:code', instance.verifyEmail)
        instance.router.post('/resend-verification',validate(resendVerificationEmailSchema), instance.resendVerificationEmail)
        instance.router.put('/', verifyToken, allowedRole('customer'), validate(updateCustomerProfileSchema), instance.updateCustomerProfile)
        instance.router.put('/password', verifyToken, allowedRole('customer'), validate(updatePasswordSchema), instance.updatePassword)
        instance.router.get('/profile', verifyToken, allowedRole('customer'), instance.getCustomerProfile)

        instance.router.get('/', verifyToken, allowedRole('admin'), instance.getCustomerList)
        instance.router.get('/:id', verifyToken, allowedRole('admin'), instance.getCustomerById)
        instance.router.delete('/:id', verifyToken, allowedRole('admin'), verifySuperAdmin, instance.deleteCustomer)

        return instance
    }

    verifyEmail = async(req: Request, res: Response)=>{
        try{
            const {code} = req.params
            const result = await this.customerService.verifyEmail(code)
            handleSuccessResponse(res, "Customer Email verified.", result)
        }catch(e: any){
            this.logger.error("Error while verifying Email.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    resendVerificationEmail = async(req: Request, res: Response) =>{
        try{
            const {email} = req.body
            const result = await this.customerService.resendVerificationEmail(email)
            handleSuccessResponse(res, "Resend Verification Email Successfully.", result)
        }catch(e:any){
            this.logger.error("Error while resending verification code.", {object:e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    getCustomerProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const customerId = req.user?._id as string
            const result = await this.customerService.getCustomerById(customerId)
            handleSuccessResponse(res, "Cusotmer Profile Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching customer profile.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateCustomerProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const customerEmail = req.user?.email as string
            const updateProfileInfo = req.body

            const result = await this.customerService.updateCustomerInfo(customerEmail, updateProfileInfo)
            handleSuccessResponse(res, "Customer Profile Updated.",result)
        }catch(e:any){
            this.logger.error("Error while updating customer profile.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updatePassword = async(req: AuthRequest, res: Response) =>{
        try{
            const email = req.user?.email as string
            const {old_password, new_password} = req.body
            const result = await this.customerService.updatePassword(email, old_password, new_password)
            handleSuccessResponse(res, "Customer Password updated.", result)
        }catch(e:any){
            this.logger.error("Error while updating password.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    
    getCustomerList = async(req:AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.page || 10
            const result = await this.customerService.getCustomerList({page: parseInt(page as string), limit: parseInt(limit as string)})

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.count,
                total_pages: Math.ceil(result.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Customer List Fetched.", result.customer, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while fetching customer list.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getCustomerById = async(req: AuthRequest, res: Response) =>{
        try{
            const customerId = req.params.id
            const result = await this.customerService.getCustomerById(customerId)
            handleSuccessResponse(res, "Customer Fetched.", result)
        }catch(e: any){
            this.logger.error("Error while fetching customer by id.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    deleteCustomer = async(req: AuthRequest, res: Response) =>{
        try{
            const customerId = req.params.id 
            const result = await this.customerService.deleteCustomer(customerId)
            handleSuccessResponse(res, "Customer Deleted.", result)
        }catch(e:any){
            this.logger.error("Error while deleting customer.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}