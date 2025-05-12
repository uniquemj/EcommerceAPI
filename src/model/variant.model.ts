import { Schema, Document, model, Model, SchemaType } from "mongoose";
import { ImageInfo } from "../types/image.types";


export enum DangerousGoods{
    No="no",
    ContainsBattery = "contains battery",
    Substance = 'flammables/liquid'
}

export enum WarrantyType{
    NoWarranty = "no warranty",
    SellerWarranty = "seller warranty"
}

interface VariantDocument extends Document{
    _id: string,
    product: Schema.Types.ObjectId
    images: ImageInfo[],
    color: string,
    price: number,
    size: string,
    stock: number,
    availability: boolean,
    packageWeight: number,
    packageLength: string,
    dangerousGoods: DangerousGoods,
    warrantyType: WarrantyType,
    warrantyPeriod: number,
    warrantyPolicy: string
}

const variantSchema: Schema<VariantDocument> = new Schema({
    product: {type: Schema.Types.ObjectId, ref: 'product'},
    images: [{
        url: {type: String}
    }],
    color: {type: String},
    size: {type: String},
    price: {type: Number},
    stock: {type: Number, min: 0},
    availability: {type: Boolean, default: true},
    packageWeight: {type: Number},
    packageLength: {type: String},
    dangerousGoods: {type: String, enum: Object.values(DangerousGoods), default: DangerousGoods.No},
    warrantyType: {type: String, enum: Object.values(WarrantyType), default: WarrantyType.NoWarranty},
    warrantyPeriod: {type: Number},
    warrantyPolicy: {type: String}
})

const Variant: Model<VariantDocument> = model('variant', variantSchema)

export default Variant;