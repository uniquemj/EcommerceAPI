import { Request } from "express";


interface IUser{
    _id?:string,
    email?:string,
    role?:string,
    is_verified?:boolean
}
export interface IAuthRequest extends Request{
    user?: IUser
}