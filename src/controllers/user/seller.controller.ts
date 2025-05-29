import { Request, Response, Router } from "express";
import { SellerServices } from "../../services/user/seller.services";
import createHttpError from "../../utils/httperror.utils";
import { validate } from "../../middlewares/validation.middleware";
import { addBusinessInfoSchema, loginSchema, resendVerificationEmailSchema, sellerRegisterSchema, updateBusinessInfoSchema, updatePasswordSchema, updateSellerVerificationSchema } from "../../validation/user.validate";
import { AuthRequest } from "../../types/auth.types";
import { COOKIE } from "../../constant/cookie";
import { SellerProfile } from "../../types/user.types";
import { verifyToken } from "../../middlewares/auth.middleware";
import { allowedRole } from "../../middlewares/role.middleware";
import { verifySuperAdmin } from "../../middlewares/admin.middleware";
import { handleSuccessResponse } from "../../utils/httpresponse.utils";
import Logger from "../../utils/logger.utils";
import winston from 'winston';
import { SellerFile} from "../../types/file.types";
import upload from "../../middlewares/file.middleware";
import { SellerImages } from "../../constant/uploadFields";

export class SellerController{
    
    readonly router: Router;
    private static instance: SellerController;
    private readonly logger: winston.Logger;
    
    private constructor(private readonly sellerServices: SellerServices, logger: Logger){
        this.router = Router();
        this.logger = logger.logger()
    }

    static initController(sellerServices: SellerServices, logger: Logger){
        if(!SellerController.instance){
            SellerController.instance = new SellerController(sellerServices, logger);
        }
        const instance = SellerController.instance;

        instance.router.post('/verify/:code', instance.verifyEmail)
        instance.router.post('/resend-verification',validate(resendVerificationEmailSchema), instance.resendVerificationEmail)
        instance.router.get('/profile', verifyToken, allowedRole('seller'), instance.getSellerProfile)
        instance.router.post('/profile', verifyToken, allowedRole('seller'), upload.fields(SellerImages), validate(addBusinessInfoSchema), instance.addBusinessInfo)
        instance.router.put('/profile', verifyToken, allowedRole('seller'), validate(updateBusinessInfoSchema), instance.updateSellerInfo)
        instance.router.put('/password', verifyToken, allowedRole('seller'), validate(updatePasswordSchema), instance.updatePassword)

        instance.router.get('/', verifyToken, allowedRole('admin'), instance.getSellerList)
        instance.router.get('/:id', verifyToken, allowedRole('admin'), instance.getSellerById)
        instance.router.post('/verify-seller/:id', verifyToken, allowedRole('admin'), instance.verifySeller)
        instance.router.post('/verify-seller/update/:id', verifyToken, allowedRole('admin'), validate(updateSellerVerificationSchema), instance.updateSellerVerification)
        instance.router.delete('/:id', verifyToken, allowedRole('admin'), verifySuperAdmin, instance.deleteSeller)
        
        return instance
    }

    verifyEmail = async(req: Request, res: Response) =>{
        try{
            const {code} = req.params
            const result = await this.sellerServices.verifyEmail(code)
            handleSuccessResponse(res, "Seller Email Verified.", result)
        }catch(e: any){
            this.logger.error("Error while verifying Email.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    resendVerificationEmail = async(req: Request, res: Response) =>{
        try{
            const {email} = req.body
            const result = await this.sellerServices.resendVerificationEmail(email)
            handleSuccessResponse(res, "Resend Verification Email Successfully.", result)
        }catch(e:any){
            this.logger.error("Error while resending verification code.", {object:e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    verifySeller = async(req: Request, res: Response) =>{
        try{
            const sellerId = req.params.id
            const result = await this.sellerServices.verifySeller(sellerId)
            handleSuccessResponse(res, "Seller Verified.", result)
        }catch(e:any){
            this.logger.error("Error while verifying Seller.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.user?._id as string
            const result = await this.sellerServices.getSellerById(sellerId)

            handleSuccessResponse(res, "Seller Profile Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while getting Seller Profile.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    addBusinessInfo = async(req: AuthRequest, res: Response) =>{
        try{
            const businessInfo = req.body as SellerProfile
            const sellerEmail = req.user?.email as string

            const files = req.files as SellerFile
            const legalFiles = files.legal_document as Express.Multer.File[]
            const storeLogo = files.store_logo as Express.Multer.File[]

            const result = await this.sellerServices.updateBusinessInfo(businessInfo, legalFiles, storeLogo, sellerEmail)
            handleSuccessResponse(res, "Business Info Added.", result)
        }catch(e:any){
            this.logger.error("Error while adding Business Info.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateSellerVerification = async(req: AuthRequest, res: Response) =>{
        try{
            const verificationInfo = req.body
            const userId = req.params.id
            const result = await this.sellerServices.updateSellerVerification(userId, verificationInfo.status, verificationInfo.rejection_reason ?? "")
            handleSuccessResponse(res, "Seller Verification Updated", result)
        }catch(e: any){
            this.logger.error("Error while updating Seller Verification.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    updateSellerInfo = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerInfo = req.body as SellerProfile
            const sellerEmail = req.user?.email as string
            const result = await this.sellerServices.updateSellerInfo(sellerInfo, sellerEmail)
            handleSuccessResponse(res, "Seller Profile Updated.", result)
        }catch(e:any){
            this.logger.error("Error while updating Seller Info.", {object: e, error: new Error()})
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
            this.logger.error("Error while updating Password.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerList = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const result = await this.sellerServices.getSellerList({page: parseInt(page as string), limit: parseInt(limit as string)})

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.count,
                total_pages: Math.ceil(result.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Seller List Fetched.", result.sellers, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while fetching seller list.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerById = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.params.id
            const result = await this.sellerServices.getSellerById(sellerId)
            handleSuccessResponse(res, "Seller Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching seller by id.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    deleteSeller = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.params.id
            const result = await this.sellerServices.deleteSeller(sellerId)
            handleSuccessResponse(res, "Seller Deleted.", result)
        }catch(e:any){
            this.logger.error("Error while deleting seller.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}