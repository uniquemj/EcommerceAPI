import { Schema, Document, model, Model, SchemaType } from "mongoose";
import { ImageInfo } from "../types/image.types";




interface VariantDocument extends Document{
    _id: string,
    product: Schema.Types.ObjectId
    images: Schema.Types.ObjectId,
    color: string,
    price: number,
    size: string,
    stock: number,
    availability: boolean,
    packageWeight: number,
    packageLength: string
}

const variantSchema: Schema<VariantDocument> = new Schema({
    product: {type: Schema.Types.ObjectId, ref: 'product'},
    images: {type: Schema.Types.ObjectId, ref: 'file'},
    color: {type: String},
    size: {type: String},
    price: {type: Number},
    stock: {type: Number, min: 0},
    availability: {type: Boolean, default: true},
    packageWeight: {type: Number},
    packageLength: {type: String}
})

const Variant: Model<VariantDocument> = model('variant', variantSchema)

export default Variant;