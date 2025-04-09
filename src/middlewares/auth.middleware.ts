import { IAuthRequest } from "../types/auth.types";
import { Response, NextFunction } from "express";
import createHttpError from "../utils/httperror.utils";
import jwt, {JwtPayload} from 'jsonwebtoken'

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string

export const verifyToken = (req: IAuthRequest, res: Response, next: NextFunction) =>{
    try{
        const {AUTH_TOKEN} = req.cookies
        if(!AUTH_TOKEN){
            throw createHttpError.Unauthorized("No token provided. Authorization denied.")
        }

        const decode = jwt.verify(AUTH_TOKEN, JWT_SECRET_KEY) as JwtPayload

        req.user = {
            _id: decode._id,
            email: decode.email,
            role: decode.role,
            is_verified: decode.is_verified
        }
        next()
    }catch(e: any){
        throw createHttpError.Custom(e.statusCode, e.message, e.errors)
    }
}