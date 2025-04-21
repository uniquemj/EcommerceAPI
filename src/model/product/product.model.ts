import { Schema, Document, Model, model } from "mongoose";
import { CategoryInfo } from "../../types/category.types";
import { VariantInfo } from "../../types/variants.types";
import { ImageInfo } from "../../types/image.types";

export enum DangerousGoods{
    No="no",
    ContainsBattery = "contains battery",
    Substance = 'flammables/liquid'
}

export enum WarrantyType{
    NoWarranty = "no warranty",
    SellerWarranty = "seller warranty"
}


interface ProductDocument extends Document{
    seller: Schema.Types.ObjectId,
    name: string,
    images: ImageInfo[],
    category: CategoryInfo[],
    variants: VariantInfo[],
    
    productDescripton: string,
    productHighlights: string,
    packageWeight: number,
    packageLength: string,
    dangerousGoods: DangerousGoods,
    warrantyType: WarrantyType,
    warrantyPeriod: number,
    warrantyPolicy: string
}

const productSchema: Schema<ProductDocument> = new Schema({
    seller: {type: Schema.Types.ObjectId, ref: 'seller'},
    name: {type: String},
    images: [{
        url: {type: String}
    }],
    category: [{type: Schema.Types.ObjectId, ref: 'category'}],
    variants: [{type: Schema.Types.ObjectId, ref: 'variant'}],
    productDescripton: {type: String},
    productHighlights: {type: String},
    packageWeight: {type: Number},
    packageLength: {type: String},
    dangerousGoods: {type: String, enum: DangerousGoods, default: DangerousGoods.No},
    warrantyType: {type: String, enum: WarrantyType, default: WarrantyType.NoWarranty},
    warrantyPeriod: {type: Number},
    warrantyPolicy: {type: String},
})

const Product: Model<ProductDocument> = model('product', productSchema)

export default Product