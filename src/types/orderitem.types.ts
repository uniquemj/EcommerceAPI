import { Schema } from "mongoose";
import { CartInputItem, CartItem } from "./cart.types";


export interface OrderItemInfo{
    _id: string
    order_id: Schema.Types.ObjectId,
    item: CartItem,
    seller_id: Schema.Types.ObjectId,
    order_status: string,
    return_reason : string
}

export interface OrderItemInputInfo{
    order_id: string,
    item: CartInputItem,
    seller_id: Schema.Types.ObjectId,
    order_status: string,
    return_reason?: string
}

export interface OrderItemCountFilter{
    order_id?: string,
    seller_id?:string
}