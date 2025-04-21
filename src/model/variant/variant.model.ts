import { Schema, Document, model, Model, SchemaType } from "mongoose";
import { ImageInfo } from "../../types/image.types";

interface VariantDocument extends Document{
    product: Schema.Types.ObjectId
    images: ImageInfo[],
    color: string,
    price: number,
    size: string,
    specialPrice: number,
    stock: number,
    sellerSKU: string,
    availability: boolean
}

const variantSchema: Schema<VariantDocument> = new Schema({
    product: {type: Schema.Types.ObjectId, ref: 'product'},
    images: [{
        url: {type: String}
    }],
    color: {type: String},
    size: {type: String},
    price: {type: Number},
    specialPrice: {type: Number, default: 1, max: 1, min: 0},
    stock: {type: Number},
    sellerSKU: {type: String},
    availability: {type: Boolean, default: true}
})

const Variant: Model<VariantDocument> = model('variant', variantSchema)

export default Variant;