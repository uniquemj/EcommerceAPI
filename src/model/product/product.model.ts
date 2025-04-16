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
    variant: VariantInfo[],
    price: number,
    specialPrice: number,
    stock: number,
    sellerSKU: string,
    availability: boolean
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
    variant: [{type: Schema.Types.ObjectId, ref: 'variant'}],
    price: {type: Number},
    specialPrice: {type: Number, min: 0, max: 1, default: 1},
    availability: {type: Boolean, default: true},
    sellerSKU: {type: String},
    stock: {type: Number, default: 1, min: 0},
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