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
            
            if(decode.role == "customer"){
                req.user = {
                    _id: decode._id,
                    email: decode.email,
                    role: decode.role,
                    is_email_verified: decode.is_email_verified
                }
            }else if(decode.role == "seller"){
                req.user = {
                    _id: decode._id,
                    email: decode.email,
                    role: decode.role,
                    is_verified: decode.is_verified,
                    is_email_verified: decode.is_email_verified
                }
            } else if(decode.role == "admin"){
                req.user={
                    _id: decode._id,
                    email: decode.email,
                    role: decode.role,
                    isSuperAdmin: decode.isSuperAdmin
                }
            }
            next()
        }catch(error){
            throw error
        }
    }catch(e: any){
        throw createHttpError.Custom(e.statusCode, e.message, e.errors)
    }
}