import { Schema, Document, model, Model } from "mongoose";
import { ImageInfo } from "../../types/image.types";

interface VariantDocument extends Document{
    images: ImageInfo[],
    color: string,
    price: number,
    specialPrice: number,
    stock: number,
    sellerSKU: string,
    availability: boolean
}

const variantSchema: Schema<VariantDocument> = new Schema({
    images: [{
        url: {types: String}
    }],
    color: {types: String},
    price: {types: Number},
    specialPrice: {types: Number, default: 1, max: 1, min: 0},
    stock: {types: Number},
    sellerSKU: {types: String},
    availability: {types: Boolean, default: true}
})

const Variant: Model<VariantDocument> = model('variant', variantSchema)

export default Variant;