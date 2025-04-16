import { NextFunction, Request, Response } from "express"
import { IAuthRequest } from "../types/auth.types"
import createHttpError from "../utils/httperror.utils"



export const allowedRole = (...allowedRole: Array<string>) =>{
    return (req: IAuthRequest, res: Response, next: NextFunction) =>{
        if(!allowedRole.includes(req.user!.role!)){
            throw createHttpError.Forbidden("Access Denied.")
        }
        next()
    }
}