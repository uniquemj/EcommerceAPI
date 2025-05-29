import { Schema, Document, Model, model } from "mongoose";
import { CategoryInfo } from "../types/category.types";
import { VariantInfo } from "../types/variants.types";
import { ArchieveStatus } from "../types/product.types";

export enum DangerousGoods{
    No="no",
    ContainsBattery = "contains battery",
    Substance = 'flammables/liquid'
}

export enum WarrantyType{
    NoWarranty = "no warranty",
    SellerWarranty = "seller warranty"
}

interface ProductDocument extends Document {
    _id: string,
    seller: Schema.Types.ObjectId,
    name: string,
    defaultVariant: Schema.Types.ObjectId,
    category: Schema.Types.ObjectId,
    variants: VariantInfo[],

    productDescripton: string,
    productHighlights: string,
    dangerousGoods: DangerousGoods,
    warrantyType: WarrantyType,
    warrantyPeriod: number,
    warrantyPolicy: string,

    isActive: boolean,
    archieveStatus: ArchieveStatus
}

const productSchema: Schema<ProductDocument> = new Schema({
    seller: { type: Schema.Types.ObjectId, ref: 'seller' },
    name: { type: String },
    defaultVariant: { type: Schema.Types.ObjectId, ref: 'variant' },
    category: { type: Schema.Types.ObjectId, ref: 'category' },
    variants: [{ type: Schema.Types.ObjectId, ref: 'variant' }],
    productDescripton: { type: String },
    productHighlights: { type: String },
    dangerousGoods: { type: String, enum: Object.values(DangerousGoods), default: DangerousGoods.No },
    warrantyType: { type: String, enum: Object.values(WarrantyType), default: WarrantyType.NoWarranty },
    warrantyPeriod: { type: Number },
    warrantyPolicy: { type: String },

    isActive: { type: Boolean, default: true },
    archieveStatus: { type: String, enum: Object.values(ArchieveStatus), default: ArchieveStatus.UnArchieve }
}, { timestamps: true })

const Product: Model<ProductDocument> = model('product', productSchema)

export default Product