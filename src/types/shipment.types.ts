import { Schema } from "mongoose"


export interface ShipmentInfo{
    _id: string,
    customer_id: Schema.Types.ObjectId,
    full_name: string,
    email: string, 
    phone_number: string,
    region: string,
    city: string,
    address: string,
    isDefault?: boolean,
    isActive?: boolean,
    isDeleted?:boolean
}

export interface ShipmentInputInfo{
    customer_id: string,
    full_name: string,
    email: string, 
    phone_number: string,
    region: string,
    city: string,
    address: string,
    isDefault?: boolean,
    isActive?: boolean,
    isDeleted?: boolean
}

export interface shipmentCountFilter{
    customer_id?: string
}