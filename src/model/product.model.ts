import { Schema, Document, Model, model } from "mongoose";
import { CategoryInfo } from "../types/category.types";
import { VariantInfo } from "../types/variants.types";


interface ProductDocument extends Document{
    seller: Schema.Types.ObjectId,
    name: string,
    defaultVariant: Schema.Types.ObjectId,
    category: CategoryInfo[],
    variants: VariantInfo[],
    
    productDescripton: string,
    productHighlights: string,
}

const productSchema: Schema<ProductDocument> = new Schema({
    seller: {type: Schema.Types.ObjectId, ref: 'seller'},
    name: {type: String},
    defaultVariant: {type: Schema.Types.ObjectId, ref: 'variant'},
    category: [{type: Schema.Types.ObjectId, ref: 'category'}],
    variants: [{type: Schema.Types.ObjectId, ref: 'variant'}],
    productDescripton: {type: String},
    productHighlights: {type: String},
})

const Product: Model<ProductDocument> = model('product', productSchema)

export default Product