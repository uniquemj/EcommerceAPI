import { Request, Response, Router } from "express";
import { SellerServices } from "../../services/user/seller.services";
import createHttpError from "../../utils/httperror.utils";
import { validate } from "../../middlewares/validation.middleware";
import { addBusinessInfoSchema, loginSchema, sellerRegisterSchema, updateBusinessInfoSchema, updatePasswordSchema } from "../../validation/user.validate";
import { AuthRequest } from "../../types/auth.types";
import { COOKIE } from "../../constant/cookie";
import { SellerProfile } from "../../types/user.types";
import { verifyToken } from "../../middlewares/auth.middleware";


export class SellerController{
    
    readonly router: Router;
    private static instance: SellerController;
    
    private constructor(private readonly sellerServices: SellerServices){
        this.router = Router();
    }

    static initController(sellerServices: SellerServices){
        const instance = new SellerController(sellerServices);
        
        SellerController.instance = instance;
        
        instance.router.post('/register', validate(sellerRegisterSchema), instance.registerSeller)
        instance.router.post('/verify/:code', instance.verifySeller)
        instance.router.post('/login',validate(loginSchema), instance.loginSeller)
        instance.router.post('/logout', instance.logoutSeller)
        instance.router.post('/profile', verifyToken, validate(addBusinessInfoSchema), instance.addBusinessInfo)
        instance.router.put('/profile', verifyToken, validate(updateBusinessInfoSchema), instance.updateSellerInfo)
        instance.router.put('/password', verifyToken, validate(updatePasswordSchema), instance.updatePassword)
        return instance
    }

    registerSeller = async(req: Request, res: Response) =>{
        try{
            const sellerInfo = req.body
            const result = await this.sellerServices.registerSeller(sellerInfo)
            res.status(200).send({message: "Seller Registered Successfully.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    verifySeller = async(req: Request, res: Response) =>{
        try{
            const {code} = req.params
            const result = await this.sellerServices.verifySeller(code)
            res.status(200).send({message: "Seller Verified.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    loginSeller = async(req: Request, res: Response) =>{
        try{
            const sellerCredentials = req.body
            const result = await this.sellerServices.loginSeller(sellerCredentials)
            const token = result.token
            const user =  result.seller

            res.cookie(COOKIE.USER_TOKEN, token,{
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 24*60*60*1000,
            })
            res.status(200).send({message: "Seller Logged in.", token: token, user: user})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    logoutSeller = async(req: AuthRequest, res: Response) =>{
        try{
            res.clearCookie('USER_TOKEN')
            res.status(200).send({message: "Seller Logged out."})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    addBusinessInfo = async(req: AuthRequest, res: Response) =>{
        try{
            const businessInfo = req.body as SellerProfile
            const sellerEmail = req.user?.email as string
            const result = await this.sellerServices.updateSellerInfo(businessInfo, sellerEmail)
            res.status(200).send({message: "Business Info Added.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statuscode, e.message, e.errors)
        }
    }


    updateSellerInfo = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerInfo = req.body as SellerProfile
            const sellerEmail = req.user?.email as string
            const result = await this.sellerServices.updateSellerInfo(sellerInfo, sellerEmail)
            res.status(200).send({message: "Seller Profile Updated", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updatePassword = async(req: AuthRequest, res: Response) =>{
        try{
            const {old_password, new_password} = req.body
            const sellerEmail = req.user?.email as string
            const result = await this.sellerServices.updatePassword(old_password, new_password, sellerEmail)
            res.status(200).send({message: "Seller password Updated.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}