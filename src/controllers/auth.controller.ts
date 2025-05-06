import { Router, Response, Request } from "express";
import { AuthRequest, UserType } from "../types/auth.types";
import { handleSuccessResponse } from "../utils/httpresponse.utils";
import createHttpError from "../utils/httperror.utils";
import { UserCredentials } from "../types/user.types";
import { AuthServiceFactory } from "./authFactory";
import { COOKIE } from "../constant/cookie";
import { middlewareDispatcher } from "../middlewares/dispatcher.middleware";
import Logger from "../utils/logger.utils";
import winston from 'winston';



export class AuthController{
    readonly router: Router
    private static instance: AuthController;
    private readonly logger: winston.Logger;

    private constructor(private readonly authServiceFactory:AuthServiceFactory, logger: Logger){
        this.router = Router()
        this.logger = logger.logger()
    }

    static initController(authServiceFactory: AuthServiceFactory, logger: Logger){
        if(!AuthController.instance){
            AuthController.instance = new AuthController(authServiceFactory, logger)
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
            this.logger.error("Error while register.", {object: e, error: new Error()})
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
            this.logger.error("Error while log in.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    logoutUser = (req: AuthRequest, res: Response) =>{
        try{
            const userType = req.params.userType
            res.clearCookie('USER_TOKEN')
            handleSuccessResponse(res, `${userType.toUpperCase()} Logged out.`,[])
        }catch(e:any){
            this.logger.error("Error while log out.",{object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}