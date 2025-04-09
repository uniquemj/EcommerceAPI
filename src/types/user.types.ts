export interface IUser{
    email: string,
    password: string,
    is_verified?: boolean,
    phone_number?: string,
    code?: string,
    readonly role: string,
}

export enum UserRole{
    CUSTOMER='customer',
    SELLER='seller'
}

export interface ICustomer{
    fullname: string,
    email: string,
    password: string,
    code?:string
}

export interface IUserCredentials{
    email: string,
    password: string
}