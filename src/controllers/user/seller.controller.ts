import { Request, Response, Router } from "express";
import { SellerServices } from "../../services/user/seller.services";
import createHttpError from "../../utils/httperror.utils";
import { validate } from "../../middlewares/validation.middleware";
import { addBusinessInfoSchema, loginSchema, sellerRegisterSchema, updateBusinessInfoSchema, updatePasswordSchema } from "../../validation/user.validate";
import { AuthRequest } from "../../types/auth.types";
import { COOKIE } from "../../constant/cookie";
import { SellerProfile } from "../../types/user.types";
import { verifyToken } from "../../middlewares/auth.middleware";
import { allowedRole } from "../../middlewares/role.middleware";
import { verifySuperAdmin } from "../../middlewares/admin.middleware";
import { handleSuccessResponse } from "../../utils/httpresponse.utils";


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
        instance.router.post('/verify/:code', instance.verifyEmail)
        instance.router.post('/login',validate(loginSchema), instance.loginSeller)
        instance.router.post('/logout', verifyToken, allowedRole('seller'), instance.logoutSeller)

        instance.router.get('/profile', verifyToken, allowedRole('seller'), instance.getSellerProfile)
        instance.router.post('/profile', verifyToken, allowedRole('seller'), validate(addBusinessInfoSchema), instance.addBusinessInfo)
        instance.router.put('/profile', verifyToken, allowedRole('seller'), validate(updateBusinessInfoSchema), instance.updateSellerInfo)
        instance.router.put('/password', verifyToken, allowedRole('seller'), validate(updatePasswordSchema), instance.updatePassword)

        instance.router.get('/', verifyToken, allowedRole('admin'), instance.getSellerList)
        instance.router.get('/:id', verifyToken, allowedRole('admin'), instance.getSellerById)
        instance.router.post('/verify-seller/:id', verifyToken, allowedRole('admin'), verifySuperAdmin, instance.verifySeller)
        instance.router.delete('/:id', verifyToken, allowedRole('admin'), verifySuperAdmin, instance.deleteSeller)
        
        return instance
    }

    registerSeller = async(req: Request, res: Response) =>{
        try{
            const sellerInfo = req.body
            const result = await this.sellerServices.registerSeller(sellerInfo)
            handleSuccessResponse(res, "Seller Registered Successfully", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    verifyEmail = async(req: Request, res: Response) =>{
        try{
            const {code} = req.params
            const result = await this.sellerServices.verifyEmail(code)
            handleSuccessResponse(res, "Seller Email Verified.", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    verifySeller = async(req: Request, res: Response) =>{
        try{
            const sellerId = req.params.id
            const result = await this.sellerServices.verifySeller(sellerId)
            handleSuccessResponse(res, "Seller Verified.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.user?._id as string
            const result = await this.sellerServices.getSellerById(sellerId)

            handleSuccessResponse(res, "Seller Profile Fetched.", result)
        }catch(e:any){
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
            handleSuccessResponse(res, "Seller Logged In.",{token: token, user: user})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    logoutSeller = async(req: AuthRequest, res: Response) =>{
        try{
            res.clearCookie('USER_TOKEN')
            handleSuccessResponse(res, "Seller Logged out.",[])
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    addBusinessInfo = async(req: AuthRequest, res: Response) =>{
        try{
            const businessInfo = req.body as SellerProfile
            const sellerEmail = req.user?.email as string
            const result = await this.sellerServices.updateSellerInfo(businessInfo, sellerEmail)
            handleSuccessResponse(res, "Business Info Added.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statuscode, e.message, e.errors)
        }
    }


    updateSellerInfo = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerInfo = req.body as SellerProfile
            const sellerEmail = req.user?.email as string
            const result = await this.sellerServices.updateSellerInfo(sellerInfo, sellerEmail)
            handleSuccessResponse(res, "Seller Profile Updated.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updatePassword = async(req: AuthRequest, res: Response) =>{
        try{
            const {old_password, new_password} = req.body
            const sellerEmail = req.user?.email as string
            const result = await this.sellerServices.updatePassword(old_password, new_password, sellerEmail)
            handleSuccessResponse(res, "Seller Password Updated.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerList = async(req: AuthRequest, res: Response) =>{
        try{
            const result = await this.sellerServices.getSellerList()
            handleSuccessResponse(res, "Seller List Fetched.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerById = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.params.id
            const result = await this.sellerServices.getSellerById(sellerId)
            handleSuccessResponse(res, "Seller Fetched.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    deleteSeller = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.params.id
            const result = await this.sellerServices.deleteSeller(sellerId)
            handleSuccessResponse(res, "Seller Deleted.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}