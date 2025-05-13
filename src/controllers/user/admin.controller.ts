import { Request, Router, Response } from "express";
import { AdminServices } from "../../services/user/admin.services";
import createHttpError from "../../utils/httperror.utils";
import { AdminInfo, AdminProfile, UserCredentials} from "../../types/user.types";
import { allowedRole } from "../../middlewares/role.middleware";
import { COOKIE } from "../../constant/cookie";
import { validate } from "../../middlewares/validation.middleware";
import { adminLoginSchema, adminRegisterSchema, updateAdminInfo, updateAdminPasswordSchema, updateNormalAdminInfo} from "../../validation/user.validate";
import { verifyToken } from "../../middlewares/auth.middleware";
import { AuthRequest } from "../../types/auth.types";
import { verifySuperAdmin } from "../../middlewares/admin.middleware";
import { handleSuccessResponse } from "../../utils/httpresponse.utils";
import Logger from "../../utils/logger.utils";

import winston from 'winston'
import { inject } from "tsyringe";

export class AdminController{
    readonly router: Router;
    private static instance: AdminController;
    private readonly logger: winston.Logger;

    private constructor(private readonly adminServices: AdminServices, logger: Logger){
        this.router = Router()
        this.logger = logger.logger()
    }

    
    static initController(adminServices: AdminServices, logger: Logger){
        if(!AdminController.instance){
            AdminController.instance = new AdminController(adminServices, logger)
        }

        const instance = AdminController.instance

        instance.router.get('/', verifyToken, allowedRole('admin'), instance.getAllAdmin)
        instance.router.get('/profile', verifyToken, allowedRole('admin'), instance.getAdminProfile)
        instance.router.get('/:id', verifyToken, allowedRole('admin'), instance.getAdminDetail)

        
        // instance.router.post('/register', verifyToken, verifySuperAdmin, allowedRole('admin'), validate(adminRegisterSchema), instance.registerAdmin)
        
        // instance.router.post('/login', validate(adminLoginSchema), instance.loginAdmin)
        // instance.router.post('/logout', verifyToken, allowedRole('admin'), instance.logoutAdmin)
        
        instance.router.put('/:id', verifyToken, verifySuperAdmin, allowedRole('admin'), validate(updateNormalAdminInfo), instance.updateOtherAdmin)
        instance.router.put('/', verifyToken, allowedRole('admin'), validate(updateAdminInfo), instance.updateAdminProfile)
       
        instance.router.delete('/:id', verifyToken, verifySuperAdmin, allowedRole('admin'), instance.deleteAdmin)

        instance.router.post('/password', verifyToken, allowedRole('admin'), validate(updateAdminPasswordSchema), instance.updatePassword)

        return instance
    }
    
    getAllAdmin = async(req: Request, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const result = await this.adminServices.getAllAdmin({page: parseInt(page as string), limit: parseInt(limit as string)})

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.count,
                total_pages: Math.ceil(result.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Admin List Fetched.", result.admins, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while fetching Admin List.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }   

    getAdminDetail = async(req: Request, res: Response) =>{
        try{
            const adminId = req.params.id 
            const result = await this.adminServices.getAdminDetail(adminId)
            handleSuccessResponse(res, "Admin Detail Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching Admin Detail.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getAdminProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const adminId = req.user?._id as string
            const result = await this.adminServices.getAdminDetail(adminId)
            handleSuccessResponse(res, "Admin Profile Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching Admin Profile.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    // registerAdmin = async(req: Request, res: Response) =>{
    //     try{
    //         const adminInfo = req.body as AdminInfo
    //         const result = await this.adminServices.registerUser(adminInfo)
    //         handleSuccessResponse(res, "Admin Created.", result)
    //     }catch(e:any){
    //         throw createHttpError.Custom(e.statusCode, e.message, e.errors)
    //     }
    // }
    
    // loginAdmin = async(req: Request, res: Response) =>{
    //     try{
    //         const userCredentials = req.body as UserCredentials
    //         const result = await this.adminServices.loginUser(userCredentials)
    //         const token = result.token
    //         const user = result.user
            
    //         res.cookie(COOKIE.USER_TOKEN,token,{
    //             httpOnly: true,
    //             sameSite: 'strict',
    //             secure: true,
    //             maxAge: 24*60*60*1000
    //         })
            
    //         handleSuccessResponse(res, "Admin Logged In.", {token: token, user: user})
    //     }catch(e:any){
    //         throw createHttpError.Custom(e.statusCode, e.message, e.errors)
    //     }
    // }
    
    // logoutAdmin = async(req: AuthRequest, res: Response) =>{
    //     try{
    //         res.clearCookie('USER_TOKEN')
    //         handleSuccessResponse(res, "Admin Logged out.", [])
    //     }catch(e:any){
    //         throw createHttpError.Custom(e.statusCode, e.message, e.errors)
    //     }
    // }


    updateOtherAdmin = async(req: Request, res: Response) =>{
        try{
            const updateAdminInfo = req.body as AdminProfile
            const adminId = req.params.id
            const result = await this.adminServices.updateAdmin(updateAdminInfo, adminId)
            handleSuccessResponse(res, "Admin Profile Updated.", result)
        }catch(e:any){
            this.logger.error("Error while updating other Admin Profile.")
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateAdminProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const updateAdminInfo = req.body as AdminProfile
            const adminId = req.user?._id as string
            const result = await this.adminServices.updateAdmin(updateAdminInfo, adminId)
            handleSuccessResponse(res, "Admin Profile Updated.", result)
        }catch(e:any){
            this.logger.error("Error while updating Admin Profile.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    deleteAdmin = async(req: AuthRequest, res: Response) =>{
        try{
            const adminId = req.params.id
            const userId = req.user?._id as string
            const result = await this.adminServices.deleteAdmin(adminId, userId)
            handleSuccessResponse(res, "Admin Removed.", result)
        }catch(e:any){
            this.logger.error("Error while removing Admin.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updatePassword = async(req: AuthRequest, res: Response)=>{
        try{
            const userEmail = req.user?.email as string
            const {old_password, new_password} = req.body
            const result = await this.adminServices.updatePassword(old_password, new_password, userEmail)
            handleSuccessResponse(res, "Password Updated.", result)
        }catch(e:any){
            this.logger.error("Error while changing password.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}