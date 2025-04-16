import { Request, Response, Router } from "express";
import { CustomerServices } from "../../services/user/customer.services";
import { validate } from "../../middlewares/validation.middleware";
import { customerRegisterSchema, loginSchema } from "../../validation/user.validate";
import createHttpError from "../../utils/httperror.utils";
import { COOKIE } from "../../constant/cookie";

export class CustomerController{
    readonly router: Router;
    private static instance: CustomerController;
    private readonly customerService: CustomerServices

    private constructor(){
        this.router = Router()
        this.customerService = new CustomerServices()
    }

    static initController(){
        const instance = new CustomerController()
        CustomerController.instance = instance
        instance.router.post('/register', validate(customerRegisterSchema), instance.registerCustomer)
        instance.router.post('/verify/:code', instance.verifyCustomer)
        instance.router.post('/login', validate(loginSchema), instance.loginCustomer)
        instance.router.post('/logout',instance.logoutCustomer)
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
}