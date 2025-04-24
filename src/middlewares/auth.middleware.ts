import { AuthRequest } from "../types/auth.types";
import { Response, NextFunction } from "express";
import createHttpError from "../utils/httperror.utils";
import { verifyJWTToken } from "../utils/helper.utils";


export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) =>{
    try{
        const {USER_TOKEN} = req.cookies

        if(!USER_TOKEN){
            throw createHttpError.Unauthorized("No token provided. Authorization denied.")
        }

        try{

            const decode = verifyJWTToken(USER_TOKEN)
            
            req.user = {
                _id: decode._id,
                email: decode.email,
                role: decode.role,
                is_verified: decode.is_verified
            }
            next()
        }catch(error){
            throw error
        }
    }catch(e: any){
        throw createHttpError.Custom(e.statusCode, e.message, e.errors)
    }
}