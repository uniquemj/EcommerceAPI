import { Router, Response, Request } from "express";
import { AuthRequest, UserType } from "../types/auth.types";
import { handleSuccessResponse } from "../utils/httpresponse.utils";
import createHttpError from "../utils/httperror.utils";
import { UserCredentials } from "../types/user.types";
import { AuthServiceFactory } from "./authFactory";
import { COOKIE } from "../constant/cookie";
import { middlewareDispatcher } from "../middlewares/dispatcher.middleware";



export class AuthController{
    readonly router: Router
    private static instance: AuthController;

    private constructor(private readonly authServiceFactory:AuthServiceFactory){
        this.router = Router()
    }

    static initController(authServiceFactory: AuthServiceFactory){
        if(!AuthController.instance){
            AuthController.instance = new AuthController(authServiceFactory)
        }
        const instance = AuthController.instance

        instance.router.use('/:userType/register', middlewareDispatcher, instance.registerUser)
        instance.router.use('/:userType/login', middlewareDispatcher, instance.loginUser)
        instance.router.use('/:userType/logout', middlewareDispatcher, instance.logoutUser)
        return instance
    }

    registerUser = async(req: AuthRequest, res: Response): Promise<void> =>{
        try{
            const userInfo = req.body
            const userType = req.params.userType as UserType

            const service = this.authServiceFactory.getService(userType)

            const result = await service.registerUser(userInfo)
            handleSuccessResponse(res, `${userType.toUpperCase()} Registered.`, result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    loginUser = async (req: Request, res: Response): Promise<void> =>{
        try{
            const userCredentials = req.body as UserCredentials
            const userType = req.params.userType as UserType
            
            const service = this.authServiceFactory.getService(userType)
            const result = await service.loginUser(userCredentials)
            const token = result.token
            const user = result.user
            
            res.cookie(COOKIE.USER_TOKEN,token,{
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                maxAge: 24*60*60*1000
            })
            
            handleSuccessResponse(res, `${userType.toUpperCase()} Logged In.`, {token: token, user: user})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    logoutUser = (req: AuthRequest, res: Response) =>{
        try{
            const userType = req.params.userType
            res.clearCookie('USER_TOKEN')
            handleSuccessResponse(res, `${userType.toUpperCase()} Logged out.`,[])
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}