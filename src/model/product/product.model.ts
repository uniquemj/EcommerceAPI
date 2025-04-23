import { Schema, Document, Model, model } from "mongoose";
import { CategoryInfo } from "../../types/category.types";
import { VariantInfo } from "../../types/variants.types";
import { ImageInfo } from "../../types/image.types";


interface ProductDocument extends Document{
    seller: Schema.Types.ObjectId,
    name: string,
    images: ImageInfo[],
    category: CategoryInfo[],
    variants: VariantInfo[],
    
    productDescripton: string,
    productHighlights: string,
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
})

const Product: Model<ProductDocument> = model('product', productSchema)

export default Product