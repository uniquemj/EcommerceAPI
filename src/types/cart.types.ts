import { Schema, Types } from "mongoose"

export interface CartItem{
    productVariant: Schema.Types.ObjectId,
    quantity: number
}

export interface CartInfo{
    _id: string,
    customer: Schema.Types.ObjectId,
    items: CartItem[]
}

export interface CartInputInfo{
    customer: string,
    items: CartInputItem[]
}

export interface CartInputItem{
    productVariant: string, 
    quantity: number
}

export interface CartTotal{
    delivery_fee: number, 
    subTotal: number, 
    total: number
}
