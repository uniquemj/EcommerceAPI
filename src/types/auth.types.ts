import { Request } from "express";


export interface User{
    _id?:string,
    email?:string,
    role?:string,
    is_verified?:boolean
}

export interface AuthRequest extends Request{
    user?: User
}