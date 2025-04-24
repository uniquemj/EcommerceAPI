import { Request, Response, Router } from "express";
import { CustomerServices } from "../../services/user/customer.services";
import { validate } from "../../middlewares/validation.middleware";
import { customerRegisterSchema, loginSchema, updatePasswordSchema } from "../../validation/user.validate";
import createHttpError from "../../utils/httperror.utils";
import { COOKIE } from "../../constant/cookie";
import { AuthRequest } from "../../types/auth.types";
import { verifyToken } from "../../middlewares/auth.middleware";
import { updateCustomerProfileSchema } from "../../validation/user.validate";

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
        instance.router.post('/verify/:code', instance.verifyCustomer)
        instance.router.post('/login', validate(loginSchema), instance.loginCustomer)
        instance.router.post('/logout',instance.logoutCustomer)
        instance.router.put('/', verifyToken, validate(updateCustomerProfileSchema), instance.updateCustomerProfile)
        instance.router.put('/password', verifyToken, validate(updatePasswordSchema), instance.updatePassword)
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

    verifyCustomer = async(req: Request, res: Response)=>{
        try{
            const {code} = req.params
            const result = await this.customerService.verifyCustomer(code)
            res.status(200).send({message:"Customer verified.", response: result})
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
            const result = this.customerService.updatePassword(email, old_password, new_password)
            res.status(200).send({message: "Customer Password Updated.", response: result})
        }catch(e:any){
            console.log("throwing in controller")
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}