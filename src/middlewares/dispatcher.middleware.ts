import { Request, Response, NextFunction } from "express";
import { UserType } from "../types/auth.types";
import { componseMiddleware } from "./compose.middleware";
import { AuthAdmin, AuthCustomer, AuthSeller } from "../constant/middlewareCollection";
import createHttpError from "../utils/httperror.utils";


enum AuthRouteType{
    Register = 'register',
    Login = 'login',
    Logout = 'logout'
}

export const middlewareDispatcher = (req: Request, res: Response, next: NextFunction) =>{
    const userType = req.params.userType as UserType
    const method = req.originalUrl.split('/').slice(-1)[0] as AuthRouteType
    
    switch(userType){
        case UserType.ADMIN:
            componseMiddleware(AuthAdmin[method])(req, res, next)
            return
        case UserType.SELLER:
            componseMiddleware(AuthSeller[method])(req, res, next)
            return
        case UserType.CUSTOMER:
            componseMiddleware(AuthCustomer[method])(req, res, next)
            return
        default:
            throw createHttpError.BadRequest("Invalid User type")
    }
}