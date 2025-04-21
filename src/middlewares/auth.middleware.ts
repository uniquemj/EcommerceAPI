import { AuthRequest } from "../types/auth.types";
import { Response, NextFunction } from "express";
import createHttpError from "../utils/httperror.utils";
import jwt, {JwtPayload} from 'jsonwebtoken'

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) =>{
    try{
        const {USER_TOKEN} = req.cookies

        if(!USER_TOKEN){
            throw createHttpError.Unauthorized("No token provided. Authorization denied.")
        }

        try{

            const decode = jwt.verify(USER_TOKEN, JWT_SECRET_KEY) as JwtPayload
            
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