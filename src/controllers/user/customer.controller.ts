import { Request, Response, Router } from "express";
import { CustomerServices } from "../../services/user/customer.services";
import { validate } from "../../middlewares/validation.middleware";
import { customerRegisterSchema, loginSchema, updatePasswordSchema } from "../../validation/user.validate";
import createHttpError from "../../utils/httperror.utils";
import { COOKIE } from "../../constant/cookie";
import { AuthRequest } from "../../types/auth.types";
import { verifyToken } from "../../middlewares/auth.middleware";
import { updateCustomerProfileSchema } from "../../validation/user.validate";
import { allowedRole } from "../../middlewares/role.middleware";
import { verifySuperAdmin } from "../../middlewares/admin.middleware";

export class CustomerController{
    
    readonly router: Router;
    private static instance: CustomerController;

    private constructor(private readonly customerService: CustomerServices){
        this.router = Router()
    }

    static initController(customerService: CustomerServices){
        const instance = new CustomerController(customerService)
        
        CustomerController.instance = instance
        instance.router.post('/register', validate(customerRegisterSchema), instance.registerCustomer)
        instance.router.post('/verify/:code', instance.verifyEmail)
        instance.router.post('/login', validate(loginSchema), instance.loginCustomer)
        instance.router.post('/logout',verifyToken, allowedRole('customer'), instance.logoutCustomer)
        
        instance.router.put('/', verifyToken, allowedRole('customer'), validate(updateCustomerProfileSchema), instance.updateCustomerProfile)
        instance.router.put('/password', verifyToken, allowedRole('customer'), validate(updatePasswordSchema), instance.updatePassword)
        instance.router.get('/profile', verifyToken, allowedRole('customer'), instance.getCustomerProfile)

        instance.router.get('/', verifyToken, allowedRole('admin'), verifySuperAdmin, instance.getCustomerList)
        instance.router.get('/:id', verifyToken, allowedRole('admin'), verifySuperAdmin, instance.getCustomerById)
        instance.router.delete('/:id', verifyToken, allowedRole('admin'), verifySuperAdmin, instance.deleteCustomer)

        return instance
    }

    registerCustomer = async(req: Request, res: Response) =>{
        try{
            const userInfo = req.body
            const result = await this.customerService.registerCustomer(userInfo)
            res.status(200).send({message: "Customer Registered Successfully.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    verifyEmail = async(req: Request, res: Response)=>{
        try{
            const {code} = req.params
            const result = await this.customerService.verifyEmail(code)
            res.status(200).send({message:"Customer Email verified.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    loginCustomer = async(req: Request, res: Response) =>{
        try{
            const userCredentials = req.body
            const result = await this.customerService.loginCustomer(userCredentials)
            const token = result.token
            const user = result.user

            res.cookie(COOKIE.USER_TOKEN, token,{
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 24*60*60*1000
            })


            res.status(200).send({message: "Customer Logged In", token: token, user: user})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    logoutCustomer = async(req: Request, res: Response) =>{
        try{
            res.clearCookie('USER_TOKEN')
            res.status(200).send({message: "Customer Logged out."})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getCustomerProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const customerId = req.user?._id as string
            const result = await this.customerService.getCustomerById(customerId)
            res.status(200).send({message:"Customer Profile Fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateCustomerProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const customerEmail = req.user?.email as string
            const updateProfileInfo = req.body

            const result = await this.customerService.updateCustomerInfo(customerEmail, updateProfileInfo)
            res.status(200).send({message: "Customer Profile Updated.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updatePassword = async(req: AuthRequest, res: Response) =>{
        try{
            const email = req.user?.email as string
            const {old_password, new_password} = req.body
            const result = await this.customerService.updatePassword(email, old_password, new_password)
            res.status(200).send({message: "Customer Password Updated.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    
    getCustomerList = async(req:AuthRequest, res: Response) =>{
        try{
            const result = await this.customerService.getCustomerList()
            res.status(200).send({message: "Cusotmer List Fetched.", response: result})
        }catch(error){
            throw error
        }
    }

    getCustomerById = async(req: AuthRequest, res: Response) =>{
        try{
            const customerId = req.params.id
            const result = await this.customerService.getCustomerById(customerId)
            res.status(200).send({message: "Customer Fetched.", response: result})
        }catch(error){
            throw error
        }
    }

    deleteCustomer = async(req: AuthRequest, res: Response) =>{
        try{
            const customerId = req.params.id 
            const result = await this.customerService.deleteCustomer(customerId)
            res.status(200).send({message: "Customer Deleted.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}