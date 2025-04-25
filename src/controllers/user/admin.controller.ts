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

export class AdminController{
    readonly router: Router;
    private static instance: AdminController;
    
    constructor(private readonly adminServices: AdminServices){
        this.router = Router()
    }

    static initController(adminServices: AdminServices){
        const instance = new AdminController(adminServices)
        AdminController.instance = instance

        instance.router.get('/', verifyToken, verifySuperAdmin, allowedRole('admin'), instance.getAllAdmin)
        instance.router.get('/:id', verifyToken, allowedRole('admin'), instance.getAdminDetail)
        
        instance.router.post('/register',verifyToken, verifySuperAdmin, allowedRole('admin'), validate(adminRegisterSchema), instance.registerAdmin)
        
        instance.router.post('/login', validate(adminLoginSchema), instance.loginAdmin)
        instance.router.post('/logout', verifyToken, allowedRole('admin'), instance.logoutAdmin)
        
        instance.router.put('/:id', verifyToken, verifySuperAdmin, allowedRole('admin'), validate(updateNormalAdminInfo), instance.updateOtherAdmin)
        instance.router.put('/', verifyToken, allowedRole('admin'), validate(updateAdminInfo), instance.updateAdminProfile)
       
        instance.router.delete('/:id', verifyToken, verifySuperAdmin, allowedRole('admin'), instance.deleteAdmin)

        instance.router.post('/password', verifyToken, allowedRole('admin'), validate(updateAdminPasswordSchema), instance.updatePassword)

        return instance
    }

    getAllAdmin = async(req: Request, res: Response) =>{
        try{
            const result = await this.adminServices.getAllAdmin()
            res.status(200).send({message: "Admin List Fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }   

    getAdminDetail = async(req: Request, res: Response) =>{
        try{
            const adminId = req.params.id 
            const result = await this.adminServices.getAdminDetail(adminId)
            res.status(200).send({message: "Admin Detail Fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    registerAdmin = async(req: Request, res: Response) =>{
        try{
            const adminInfo = req.body as AdminInfo
            const result = await this.adminServices.createAdmin(adminInfo)
            res.status(200).send({message: "Admin Created.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    
    loginAdmin = async(req: Request, res: Response) =>{
        try{
            const userCredentials = req.body as UserCredentials
            const result = await this.adminServices.loginAdmin(userCredentials)
            const token = result.token
            const user = result.user
            
            res.cookie(COOKIE.USER_TOKEN,token,{
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                maxAge: 24*60*60*1000
            })
            
            res.status(200).send({message: "Admin Logged In.", token: token, user: user})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    
    logoutAdmin = async(req: Request, res: Response) =>{
        try{
            res.clearCookie('USER_TOKEN')
            res.status(200).send({message: "Admin Logged out."})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateOtherAdmin = async(req: Request, res: Response) =>{
        try{
            const updateAdminInfo = req.body as AdminProfile
            const adminId = req.params.id
            const result = await this.adminServices.updateAdmin(updateAdminInfo, adminId)
            res.status(200).send({message: "Admin Profile Updated.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateAdminProfile = async(req: AuthRequest, res: Response) =>{
        try{
            const updateAdminInfo = req.body as AdminProfile
            const adminId = req.user?._id as string
            const result = await this.adminServices.updateAdmin(updateAdminInfo, adminId)
            res.status(200).send({message: "Admin profile updated.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    deleteAdmin = async(req: AuthRequest, res: Response) =>{
        try{
            const adminId = req.params.id
            const userId = req.user?._id as string
            const result = await this.adminServices.deleteAdmin(adminId, userId)
            res.status(200).send({message: "Admin Removed.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updatePassword = async(req: AuthRequest, res: Response)=>{
        try{
            const userEmail = req.user?.email as string
            const {old_password, new_password} = req.body
            const result = await this.adminServices.updatePassword(old_password, new_password, userEmail)
            res.status(200).send({message: "Password Updated.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}