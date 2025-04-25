import { Types } from "mongoose"
import { ImageInfo } from "./image.types"

export interface User{
    fullname: string,
    email: string,
    password: string,
    is_email_verified?: boolean,
    phone_number?: string,
    code?: string,
    readonly role?: string,
}

export enum UserRole{
    CUSTOMER='customer',
    SELLER='seller',
    ADMIN='admin'
}

export interface CustomerInfo extends User{
    _id?:string,
    fullname: string,
}

export interface SellerInfo extends User{
    _id?:string,
    store_name: string,
    is_verified?: boolean,
}

export interface UserCredentials{
    email: string,
    password: string
}

export interface CustomerProfile{
    fullname?: string,
    password?: string,
    phone_number?: string,
    date_of_birth?: string
}

export interface SellerProfile{
    store_name?: string,
    legal_document?: ImageInfo[],
    address?: string,
    city?: string,
    country?: string,
    phone_number?: string,
    password?:string
}