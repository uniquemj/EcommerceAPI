import { Types } from "mongoose"

export interface User{
    email: string,
    password: string,
    is_verified?: boolean,
    phone_number?: string,
    code?: string,
    readonly role?: string,
}

export enum UserRole{
    CUSTOMER='customer',
    SELLER='seller'
}

export interface CustomerInfo extends User{
    _id?:string,
    fullname: string,
}

export interface SellerInfo extends User{
    _id?:string,
    store_name: string,
}

export interface UserCredentials{
    email: string,
    password: string
}