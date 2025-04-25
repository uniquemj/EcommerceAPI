import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import createHttpError from "../utils/httperror.utils";


export const verifySuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) =>{
    const isSuperAdmin = req.user?.isSuperAdmin
    if(!isSuperAdmin){
        throw createHttpError.Forbidden("Access denied.")
    }
    next()
}