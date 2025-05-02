import { Request, Response, Router } from "express";
import { handleSuccessResponse } from "../utils/httpresponse.utils";
import createHttpError from "../utils/httperror.utils";
import { UserCredentials } from "./user.types";

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

export enum UserType{
    ADMIN = 'admin',
    SELLER = 'seller',
    CUSTOMER = 'customer'
}



export interface AuthService<TUserInfo = unknown, TUser = unknown>{
    registerUser(userInfo: TUserInfo):Promise<TUser>,
    loginUser(userCredentials: UserCredentials): Promise<{token: string, user: TUser}>
}