import { Schema, Types } from "mongoose"
import { ImageInfo } from "./image.types"

export interface User{
    fullname: string,
    email: string,
    password: string,
    is_email_verified?: boolean,
    phone_number?: string,
    code?: string | null,
    readonly role?: string,
}

export enum UserRole{
    CUSTOMER='customer',
    SELLER='seller',
    ADMIN='admin'
}
export interface AdminInfo extends User{
    _id?:string,
    username: string,
    isSuperAdmin: boolean
}
export interface CustomerInfo extends User{
    _id:string,
    date_of_birth?: Date,
    codeExpiresAt?: Date
}

export interface SellerInfo extends User{
    _id:string
    store_name: string,
    legal_document: Schema.Types.ObjectId[],
    address: string,
    city: string,
    country: string,
    is_verified?: boolean,
    codeExpiresAt?:Date
}

export interface UserCredentials{
    email: string,
    password: string
}

export interface CustomerProfile{
    fullname?: string,
    password?: string,
    phone_number?: string,
    date_of_birth?: string,
    is_email_verified?:boolean,
    code?: string | null,
    codeExpiresAt?: Date | null

}

export interface SellerProfile{
    store_name?: string,
    legal_document?: string[],
    store_logo?:string[],
    address?: string,
    city?: string,
    country?: string,
    phone_number?: string,
    password?:string,
    is_email_verified?:boolean,
    code?:string|null,
    codeExpiresAt?:Date|null
}

export interface AdminProfile{
    fullname?:string,
    password?:string
}

export interface SearchUserField{
    code?:string,
    _id?:string
}

export interface VerifyField{
    is_email_verified?:boolean,
    is_verified?:boolean,
}