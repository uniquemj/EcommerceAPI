import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import createHttpError from "../utils/httperror.utils";


export const verifySeller = (req: AuthRequest, res: Response, next: NextFunction) =>{
    const isSellerVerified = req.user?.is_verified
    const role = req.user?.role
    if(!isSellerVerified && role =='seller'){
        throw createHttpError.Unauthorized("Please get verify from admin by filling up your seller information form.")
    }
    next()
}