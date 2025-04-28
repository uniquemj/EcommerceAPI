import { Request } from "express";

export interface User{
    _id?:string,
    email?:string,
    role?:string,
    is_verified?:boolean,
    is_email_verified?: boolean,
    isSuperAdmin?:boolean
}

export interface AuthRequest extends Request{
    user?: User
}
